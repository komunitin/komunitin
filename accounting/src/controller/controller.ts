import { PrismaClient } from "@prisma/client"
import { Keypair } from "@stellar/stellar-sdk"
import { Ledger, createStellarLedger } from "../ledger"
import { deriveKey, encrypt, randomKey } from "../utils/crypto"
import { SharedController } from "."
import { friendbot } from "../ledger/stellar/friendbot"
import { logger } from "../utils/logger"
import { loadConfig } from "./config"
import { KeyObject } from "node:crypto"
import { InputCurrency, Currency, currencyFromRecord } from "../model/currency"

export async function createController(): Promise<SharedController> {
  const config = loadConfig()
  // Master symmetric key for encrypting secrets.
  const masterPassword = config.MASTER_PASSWORD
  let masterKeyObject: KeyObject
  const isProduction = config.STELLAR_NETWORK === "public"
  if (masterPassword) {
    if (isProduction && (masterPassword.length < 16)) {
      throw new Error("MASTER_PASSWORD must be at least 16 characters long.")
    }
    if (isProduction && (!config.MASTER_PASSWORD_SALT || config.MASTER_PASSWORD_SALT.length < 16)) {
      throw new Error("MASTER_PASSWORD_SALT must be provided and at least 16 characters long.")
    }
    const salt = config.MASTER_PASSWORD_SALT || "komunitin.org"
    masterKeyObject = await deriveKey(masterPassword, salt)
    
  } else if (!isProduction) {
    logger.warn("MASTER_ENCRYPTION_KEY not provided. Creating a random one.")
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
    throw new Error("Either SPONSOR_PRIVATE_KEY or STELLAR_FRIENDBOT_URL must be provided.")
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

class LedgerController implements SharedController {
  db: PrismaClient
  ledger: Ledger
  private sponsorKey: () => Promise<Keypair>
  private masterKey: () => Promise<KeyObject>

  constructor(ledger: Ledger, db: PrismaClient, masterKey: () => Promise<KeyObject>, sponsorKey: () => Promise<Keypair>) {
    this.ledger = ledger
    this.sponsorKey = sponsorKey
    this.db = db
    this.masterKey = masterKey
  }

  async createCurrency(currency: InputCurrency): Promise<Currency> {
    // Validate input beyond syntactic validation.
    if (await this.currencyExists(currency.code)) {
      throw new Error(`Currency with code ${currency.code} already exists.`)
    }
    // Add the currency to the DB
    let record = await this.db.currency.create({
      data: {
        ...currency,
        tenantId: currency.code,
        status: "new",
        rateN: currency.rate.n,
        rateD: currency.rate.d,
      }
    })

    // Create the currency on the ledger.
    const defaultMaximumBalance = record.defaultMaximumBalance 
      ? (record.defaultMaximumBalance + record.defaultMaximumBalance).toString()
      : undefined
    
    const keys = await this.ledger.createCurrency({
      code: record.code,
      rate: { n: record.rateN, d: record.rateD },
      defaultInitialBalance: record.defaultCreditLimit.toString(),
      defaultMaximumBalance,
    }, await this.sponsorKey())

    // Store the keys into the DB.
    const currencyKeyIds = {
      issuerKeyId: (await this.storeKey(record.code, keys.issuer)).id,
      creditKeyId: (await this.storeKey(record.code, keys.credit)).id,
      adminKeyId: (await this.storeKey(record.code, keys.admin)).id,
      externalIssuerKeyId: (await this.storeKey(record.code, keys.externalIssuer)).id,
      externalTraderKeyId: (await this.storeKey(record.code, keys.externalTrader)).id
    }
    
    // Update the currency record in DB
    record = await this.db.currency.update({
      where: { id: record.id },
      data: {
        status: "active",
        ...currencyKeyIds
      }
    })

    return currencyFromRecord(record)

  }
  /**
   * Implements {@link SharedController.getCurrencies}
   */
  async getCurrencies(): Promise<Currency[]> {
    const records = await this.db.currency.findMany()
    const currencies = records.map(r => currencyFromRecord(r))
    return currencies
  }
  /**
   * Implements {@link SharedController.getCurrency}
   */
  async getCurrency(code: string): Promise<Currency> {
    const record = await this.db.currency.findUniqueOrThrow({
      where: { code }
    })
    return currencyFromRecord(record)
  }

  async currencyExists(code: string): Promise<boolean> {
    const result = await this.db.currency.findUnique({
      select: { code: true },
      where: { code }
    })
    return result !== null
  }
  
  async storeKey(code: string, key: Keypair) {
    const encryptedSecret = await encrypt(key.secret(), await this.masterKey())
    return await this.db.encryptedSecret.create({
      data: {
        tenantId: code,
        id: key.publicKey(),
        encryptedSecret
      }
    })
  }
}