import {describe, it, before} from "node:test"
import assert from "node:assert"

import { Ledger, LedgerCurrency, LedgerCurrencyKeys } from "../../src/ledger"
import { StellarLedger } from "../../src/ledger/stellar"
import { Keypair, Networks } from "@stellar/stellar-sdk"
import { friendbot } from "./utils"

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
})