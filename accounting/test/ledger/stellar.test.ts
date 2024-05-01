import {describe, it, before} from "node:test"
import assert from "node:assert"

import { Ledger, LedgerCurrency, LedgerCurrencyKeys } from "../../src/ledger"
import { StellarLedger } from "../../src/ledger/stellar"
import { Keypair, Networks } from "@stellar/stellar-sdk"
import { friendbot } from "./utils"

/**
 * Test the Stellar ledger implementation using the real Stellar testnet.
 * Note that this test is not 100% deterministic because it depends on the 
 * 
 * Stellar testnet and in any case it may take up to 2 minutes to run.
 */
describe('Creates stellar elements', async () => {
  let ledger: Ledger
  let sponsor: Keypair

  before(async() => {
    // Create and fund a sponsor account.
    sponsor = Keypair.random()
    await friendbot(sponsor.publicKey())

    // Instantiate the ledger.
    ledger = new StellarLedger({
      server: 'https://horizon-testnet.stellar.org',
      network: Networks.TESTNET,
      sponsorPublicKey: sponsor.publicKey(),
      domain: "example.com"
    })
  })

  let currency: LedgerCurrency
  let currencyKeys: LedgerCurrencyKeys
  const pubKeyRegex = /G[A-Z0-9]{55}/
  await it('should be able to create a new currency', async() => {
    const result = await ledger.createCurrency({
      code: "TEST",
      rate: {n: 1, d: 10},
      defaultInitialBalance: "1000"
    }, sponsor)
    currency = result.currency
    currencyKeys = result.keys
    
    assert.notEqual(currency,undefined)

    assert.match(currencyKeys.issuer.publicKey(),pubKeyRegex)
    assert.match(currencyKeys.credit.publicKey(),pubKeyRegex)
    assert.match(currencyKeys.admin.publicKey(), pubKeyRegex)
    assert.match(currencyKeys.externalIssuer.publicKey(), pubKeyRegex)
    assert.match(currencyKeys.externalTrader.publicKey(), pubKeyRegex)
  })

  let accountKey: Keypair
  await it('should be able to create a new account', async () => {
    const result = await currency.createAccount({
      sponsor: sponsor,
      issuer: currencyKeys.issuer,
      credit: currencyKeys.credit
    })
    accountKey = result.key
    assert.notEqual(accountKey, undefined)
    assert.match(accountKey.publicKey(), pubKeyRegex)
    const account = await currency.getAccount(accountKey.publicKey())
    assert.equal(account.balance(),"1000.0000000")
  })

  let account2Key: Keypair
  await it('should be able to pay from one account to another', async() => {
    account2Key = (await currency.createAccount({sponsor, issuer: currencyKeys.issuer, credit: currencyKeys.credit})).key
    const account = await currency.getAccount(accountKey.publicKey())
    await account.pay({payeePublicKey: account2Key.publicKey(), amount: "100"}, {account: accountKey, sponsor})
    await account.update()
    assert.equal(account.balance(),"900.0000000")
    const account2 = await currency.getAccount(account2Key.publicKey())
    assert.equal(account2.balance(),"1100.0000000")
  })

  await it('should be able to delete an account', async() => {
    const account2 = await currency.getAccount(account2Key.publicKey())
    await account2.delete({admin: currencyKeys.admin, sponsor})
    try {
      account2.balance()
      assert.fail("Account should have been deleted")
    } catch (error) {
      assert.equal((error as Error).message, "Account not found")
    }
  })

  let currency2: LedgerCurrency
  let currency2Keys: LedgerCurrencyKeys
  await it('should be able to perform path payments', async() => {
    // Create a second currency.
    const result = await ledger.createCurrency({
      code: "TES2",
      rate: {n: 1, d: 2},
      defaultInitialBalance: "1000",
      externalTraderInitialBalance: "10000"
    }, sponsor)
    currency2 = result.currency
    currency2Keys = result.keys
    await assert.doesNotReject(currency2.trustCurrency({
      trustedPublicKey: currencyKeys.externalIssuer.publicKey(),
      limit: "10" // 5 hours
    }, {
      sponsor,
      externalTrader: currency2Keys.externalTrader,
      externalIssuer: currency2Keys.externalIssuer
    }))
    // Create account from currency 2
    const {key: key2} = await currency2.createAccount({
      sponsor,
      issuer: currency2Keys.issuer,
      credit: currency2Keys.credit
    })
    // Create account from currency 1
    const {key: key1} = await currency.createAccount({
      sponsor,
      issuer: currencyKeys.issuer,
      credit: currencyKeys.credit
    })
    // Create a path payment from currency 1 to currency 2.
    const path = await currency.quotePath({
      destCode: "TES2",
      destIssuer: currency2Keys.issuer.publicKey(),
      amount: "5" // 2.5 hours.
    })
    assert.notEqual(path, false)
    if (path) {
      assert.equal(path.sourceAmount, "25.0000000")
      assert.equal(path.destAmount, "5.0000000")
      assert.equal(path.sourceAsset.code, "TEST")
      assert.equal(path.destAsset.code, "TES2")
      assert.equal(path.path.length, 2)
      assert.equal(path.path[0].code, "HOUR")
      assert.equal(path.path[0].issuer, currencyKeys.externalIssuer.publicKey())
      assert.equal(path.path[1].code, "HOUR")
      assert.equal(path.path[1].issuer, currency2Keys.externalIssuer.publicKey())

      const account1 = await currency.getAccount(key1.publicKey())
      await assert.doesNotReject(account1.externalPay({
        payeePublicKey: key2.publicKey(),
        amount: "5", // in external currency
        path
      }, {
        account: key1,
        sponsor
      }))

      await account1.update()
      assert.equal(account1.balance(),"975.0000000")
      const destAccount = await currency2.getAccount(key2.publicKey())
      assert.equal(destAccount.balance(),"1005.0000000")
    }
  })
})