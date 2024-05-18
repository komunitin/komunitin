import { PrismaClient, Currency as CurrencyRecord } from "@prisma/client"
import { Keypair } from "@stellar/stellar-sdk"
import { Ledger, LedgerCurrencyConfig, LedgerCurrencyData, LedgerCurrencyState, createStellarLedger } from "../ledger"
import { decrypt, deriveKey, encrypt, exportKey, importKey, randomKey } from "../utils/crypto"
import { SharedController } from "."
import { friendbot } from "../ledger/stellar/friendbot"
import { logger } from "../utils/logger"
import { loadConfig } from "./config"
import { KeyObject } from "node:crypto"
import { CreateCurrency, Currency, recordToCurrency, currencyToRecord } from "../model/currency"
import { badConfig, badRequest, internalError, notFound } from "src/utils/error"
import { LedgerCurrencyController, storeCurrencyKey } from "./currency"
import { PrivilegedPrismaClient, TenantPrismaClient, privilegedDb, tenantDb } from "./multitenant"
import { installDefaultListeners } from "src/ledger/listener"

export async function createController(): Promise<SharedController> {
  const config = loadConfig()
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
  const defaultMaximumBalance = currency.defaultMaximumBalance 
    ? (currency.defaultCreditLimit + currency.defaultMaximumBalance).toString()
    : undefined
  return {
    code: currency.code,
    rate: currency.rate,
    defaultInitialCredit: currency.defaultCreditLimit.toString(),
    defaultMaximumBalance
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

const currencyState = (currency: Currency): LedgerCurrencyState => {
  return currency.state
}

export class LedgerController implements SharedController {
  
  ledger: Ledger
  private _db: PrismaClient
  private sponsorKey: () => Promise<Keypair>
  private masterKey: () => Promise<KeyObject>

  constructor(ledger: Ledger, db: PrismaClient, masterKey: () => Promise<KeyObject>, sponsorKey: () => Promise<Keypair>) {
    this.ledger = ledger
    this._db = db
    this.sponsorKey = sponsorKey
    this.masterKey = masterKey
    installDefaultListeners(ledger, async (currency, state) => {
        const code = currency.asset().code
        const controller = await this.getCurrencyController(code)
        await controller.updateState(state)
      },
      sponsorKey,
      async (currency) => {
        const code = currency.asset().code
        const controller = await this.getCurrencyController(code)
        return controller.externalTraderKey()
      })
  }

  privilegedDb(): PrivilegedPrismaClient {
    return privilegedDb(this._db)
  }

  tenantDb(tenantId: string) : TenantPrismaClient {
    return tenantDb(this._db, tenantId)
  }

  async createCurrency(currency: CreateCurrency): Promise<Currency> {
    // Validate input beyond syntactic validation.
    if (await this.currencyExists(currency.code)) {
      throw badRequest(`Currency with code ${currency.code} already exists`)
    }
    // Create and save a symmetric encryption key for this currency:
    const currencyKey = await this.storeKey(currency.code, await randomKey())
    
    // Add the currency to the DB
    const inputRecord = currencyToRecord(currency)
    const db = this.tenantDb(currency.code)

    let record = await db.currency.create({
      data: {
        ...inputRecord,
        status: "new",
        encryptionKey: {
          connect: {
            id: currencyKey.id
          }
        }
      },
      
    })

    // Create the currency on the ledger.
    const keys = await this.ledger.createCurrency(
      currencyConfig(currency), 
      await this.sponsorKey()
    )

    const storeKey = (key: Keypair) => storeCurrencyKey(key, db, this.masterKey)

    // Store the keys into the DB.
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
   * Implements {@link SharedController.getCurrencies}
   */
  async getCurrencies(): Promise<Currency[]> {
    const records = await this.privilegedDb().currency.findMany()
    const currencies = records.map(r => recordToCurrency(r))
    return currencies
  }

  /**
   * Implements {@link SharedController.getCurrency}
   */
  async getCurrency(code: string): Promise<Currency> {
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
    await this.ledger.stop()
    await this._db.$disconnect()
  }

  async getCurrencyController(code: string): Promise<LedgerCurrencyController> {
    const currency = await this.getCurrency(code)
    const ledgerCurrency = this.ledger.getCurrency(currencyConfig(currency), currencyData(currency), currencyState(currency))
    const db = this.tenantDb(code)
    const encryptionKey = () => this.retrieveKey(code, currency.encryptionKey)
    return new LedgerCurrencyController(currency, ledgerCurrency, db, encryptionKey, this.sponsorKey)
  }
}

