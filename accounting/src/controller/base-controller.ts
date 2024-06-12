import { PrismaClient } from "@prisma/client"
import { Keypair } from "@stellar/stellar-sdk"
import cron from "node-cron"
import { KeyObject } from "node:crypto"
import { initUpdateExternalOffers } from "src/ledger/update-external-offers"
import { Context, systemContext } from "src/utils/context"
import { badConfig, badRequest, internalError, notFound } from "src/utils/error"
import TypedEmitter from "typed-emitter"
import { ControllerEvents, SharedController as BaseController } from "."
import { config } from "../config"
import { Ledger, LedgerCurrencyConfig, LedgerCurrencyData, createStellarLedger } from "../ledger"
import { friendbot } from "../ledger/stellar/friendbot"
import { CreateCurrency, Currency, currencyToRecord, recordToCurrency } from "../model/currency"
import { decrypt, deriveKey, encrypt, exportKey, importKey, randomKey } from "../utils/crypto"
import { logger } from "../utils/logger"
import { LedgerCurrencyController, storeCurrencyKey } from "./currency-controller"
import { migrateFromIntegralces } from "./migration/integralces"
import { CreateMigration, Migration } from "./migration/migration"
import { PrivilegedPrismaClient, TenantPrismaClient, privilegedDb, tenantDb } from "./multitenant"
import { EventEmitter } from "node:events"
import { initUpdateCreditOnPayment } from "./features/credit-on-payment"
import { initNotifications } from "./features/notificatons"


export async function createController(): Promise<BaseController> {
  // Master symmetric key for encrypting secrets.
  const masterPassword = config.MASTER_PASSWORD
  let masterKeyObject: KeyObject
  const isProduction = config.STELLAR_NETWORK === "public"
  if (masterPassword) {
    if (isProduction && (masterPassword.length < 16)) {
      throw badConfig("MASTER_PASSWORD must be at least 16 characters long")
    }
    if (isProduction && (!config.MASTER_PASSWORD_SALT || config.MASTER_PASSWORD_SALT.length < 16)) {
      throw badConfig("MASTER_PASSWORD_SALT must be provided and at least 16 characters long")
    }
    const salt = config.MASTER_PASSWORD_SALT || "komunitin.org"
    masterKeyObject = await deriveKey(masterPassword, salt)
    
  } else if (!isProduction) {
    logger.warn("MASTER_ENCRYPTION_KEY not provided. Creating a random one")
    masterKeyObject = await randomKey()
  }
  const masterKey = async () => masterKeyObject

  // Sponsor
  let sponsor: Keypair | undefined
  if (config.SPONSOR_PRIVATE_KEY) {
    sponsor = Keypair.fromSecret(config.SPONSOR_PRIVATE_KEY)
  }
  else if (["testnet", "local"].includes(config.STELLAR_NETWORK) && config.STELLAR_FRIENDBOT_URL) {
    // Create a new random sponsor account with friendbot.
    sponsor = Keypair.random()
    await friendbot(config.STELLAR_FRIENDBOT_URL, sponsor.publicKey())
    logger.info(`Sponsor account created. Private Key: ${sponsor.secret()}`)
  } else {
    throw badConfig("Either SPONSOR_PRIVATE_KEY or STELLAR_FRIENDBOT_URL must be provided")
  }
  const sponsorKey = async () => sponsor

  const ledger = createStellarLedger({
    server: config.STELLAR_HORIZON_URL,
    network: config.STELLAR_NETWORK,
    sponsorPublicKey: sponsor.publicKey(),
    domain: config.DOMAIN
  })
  
  const db = new PrismaClient()

  return new LedgerController(ledger, db, masterKey, sponsorKey)
}

const currencyConfig = (currency: CreateCurrency): LedgerCurrencyConfig => {
  return {
    code: currency.code,
    rate: currency.rate,
  }
}

const currencyData = (currency: Currency): LedgerCurrencyData => {
  const keys = currency.keys
  if (!keys) {
    throw internalError("Missing keys in currency record")
  }
  return {
    issuerPublicKey: keys.issuer,
    creditPublicKey: keys.credit,
    adminPublicKey: keys.admin,
    externalIssuerPublicKey: keys.externalIssuer,
    externalTraderPublicKey: keys.externalTrader
  }
}


export class LedgerController implements BaseController {
  
  ledger: Ledger
  private _db: PrismaClient
  private cronTask: cron.ScheduledTask

  emitter: TypedEmitter<ControllerEvents>

  private sponsorKey: () => Promise<Keypair>
  private masterKey: () => Promise<KeyObject>

  constructor(ledger: Ledger, db: PrismaClient, masterKey: () => Promise<KeyObject>, sponsorKey: () => Promise<Keypair>) {
    this.ledger = ledger
    this._db = db
    this.sponsorKey = sponsorKey
    this.masterKey = masterKey
    this.emitter = new EventEmitter() as TypedEmitter<ControllerEvents>

    // External trade sync
    initUpdateExternalOffers(ledger,
      sponsorKey,
      async (currency) => {
        const code = currency.asset().code
        const controller = await this.getCurrencyController(code)
        return controller.externalTraderKey()
      })

    // Save the state of the currency in the DB when it changes.
    this.ledger.addListener("stateUpdated", async (currency, state) => {
      const code = currency.asset().code
      const controller = await this.getCurrencyController(code)
      await controller.updateState(state)
    })

    // Feature: update credit limit on received payments (for enabled currencies and accounts)
    initUpdateCreditOnPayment(this)

    // Feature: post events to notifications service.
    initNotifications(this)

    // run cron every 5 minutes.
    this.cronTask = cron.schedule("* * * * */5", () => {
      this.cron()
    })
  }

  public addListener<E extends keyof ControllerEvents>(event: E, listener: ControllerEvents[E]) {
    return this.emitter.addListener(event, listener)
  }

  public removeListener<E extends keyof ControllerEvents>(event: E, listener: ControllerEvents[E]) {
    return this.emitter.removeListener(event, listener)
  }

  privilegedDb(): PrivilegedPrismaClient {
    return privilegedDb(this._db)
  }

  tenantDb(tenantId: string) : TenantPrismaClient {
    return tenantDb(this._db, tenantId)
  }

  async createCurrency(ctx: Context, currency: CreateCurrency): Promise<Currency> {
    // Validate input beyond syntactic validation.
    if (await this.currencyExists(currency.code)) {
      throw badRequest(`Currency with code ${currency.code} already exists`)
    }
    if (ctx.userId === undefined) {
      // This should not happen as the middleware checks it.
      throw internalError("User ID not provided in context")
    }
    // Create and save a currency key that will be used to encrypt all other keys
    // related to this currency. This key itself is encrypted using the master key.
    const currencyKey = await randomKey()
    const encryptedCurrencyKey = await this.storeKey(currency.code, currencyKey)
    
    // Add default settings:
    currency.settings = {
      // defaultInitialCreditLimit: 0,
      defaultInitialMaximumBalance: undefined,
      defaultAcceptPaymentsAutomatically: false,
      defaultAcceptPaymentsAfter: 15*24*60*60, // 15 days,
      defaultAcceptPaymentsWhitelist: [],
      defaultOnPaymentCreditLimit: undefined,
      ...currency.settings
    }

    // Add the currency to the DB
    const inputRecord = currencyToRecord(currency)
    const db = this.tenantDb(currency.code)

    // Use logged in user as admin if not provided.
    const admin = currency.admin?.id ?? ctx.userId
    // Check that the user is not already being used in other tenant.
    const user = await this.privilegedDb().user.findUnique({where: { id: admin }})
    if (user) {
      throw badRequest(`User ${admin} is already being used in another tenant`)
    }
    
    let record = await db.currency.create({
      data: {
        ...inputRecord,
        status: "new",
        encryptionKey: {
          connect: {
            id: encryptedCurrencyKey.id
          }
        },
        admin: {
          connectOrCreate: {
            where: { id: admin },
            create: { id: admin }
          }
        }
      },
    })

    // Create the currency on the ledger.
    const keys = await this.ledger.createCurrency(
      currencyConfig(currency), 
      await this.sponsorKey()
    )
    
    // Store the keys into the DB, encrypted using the currency key.
    const storeKey = (key: Keypair) => storeCurrencyKey(key, db, async () => currencyKey)
    const currencyKeyIds = {
      issuerKeyId: await storeKey(keys.issuer),
      creditKeyId: await storeKey(keys.credit),
      adminKeyId: await storeKey(keys.admin),
      externalIssuerKeyId: await storeKey(keys.externalIssuer),
      externalTraderKeyId: await storeKey(keys.externalTrader)
    }
    
    // Update the currency record in DB
    record = await db.currency.update({
      where: { id: record.id },
      data: {
        status: "active",
        ...currencyKeyIds
      }
    })

    return recordToCurrency(record)

  }
  /**
   * Implements {@link BaseController.getCurrencies}
   */
  async getCurrencies(ctx: Context): Promise<Currency[]> {
    const records = await this.privilegedDb().currency.findMany()
    const currencies = records.map(r => recordToCurrency(r))
    return currencies
  }

  private async loadCurrency(code: string): Promise<Currency> {
    const record = await this.tenantDb(code).currency.findUnique({where: { code }})
    if (!record) {
      throw notFound(`Currency with code ${code} not found`)
    }
    return recordToCurrency(record)
  }

  async currencyExists(code: string): Promise<boolean> {
    const result = await this.tenantDb(code).currency.findUnique({
      select: { code: true },
      where: { code }
    })
    return result !== null
  }

  /**
   * Stores a key into the DB, encrypted with the master key. Used to store currency master
   * encryption key.
   */
  async storeKey(code: string, key: KeyObject) {
    const encryptedSecret = await encrypt(exportKey(key), await this.masterKey())
    return await this.tenantDb(code).encryptedSecret.create({
      data: {
        encryptedSecret
      }
    })
  }

  async retrieveKey(code: string, id: string) {
    const result = await this.tenantDb(code).encryptedSecret.findUniqueOrThrow({
      where: { id }
    })
    const secret = await decrypt(result.encryptedSecret, await this.masterKey())
    return importKey(secret)
  }

  async stop() {
    this.cronTask.stop()
    this.ledger.stop()
    this.emitter.removeAllListeners()
    await this._db.$disconnect()
  }

  async getCurrencyController(code: string): Promise<LedgerCurrencyController> {
    const currency = await this.loadCurrency(code)
    const ledgerCurrency = this.ledger.getCurrency(currencyConfig(currency), currencyData(currency), currency.state)
    const db = this.tenantDb(code)
    const encryptionKey = () => this.retrieveKey(code, currency.encryptionKey)
    return new LedgerCurrencyController(currency, ledgerCurrency, db, encryptionKey, this.sponsorKey, this.emitter)
  }

  async cron() {
    logger.info("Running cron")
    // Run cron for each currency.
    try {
      const ctx = systemContext()
      const currencies = await this.getCurrencies(ctx)
      for (const currency of currencies) {
        const currencyController = await this.getCurrencyController(currency.code)
        await currencyController.cron(ctx)
      }
    } catch (e) {
      logger.error(e, "Error running cron")
    }
  }
}

