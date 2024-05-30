import { Currency, User, Account, Transfer, AccountSettings } from '../model';
import { Paginator, Relator, Serializer, SingleOrArray } from 'ts-japi';

const projection = <T>(fields: (keyof T)[]) => {
  return Object.fromEntries(fields.map(field => [field, 1]))
}
export const UserSerializer = new Serializer<User>("users", {
  version: null,
  projection: null
})
// JSON:API resource serializers
export const CurrencySerializer = new Serializer<Currency>("currencies", {
  version: null,
  projection: projection<Currency>(['code', 'status', 'name', 'namePlural', 
    'symbol', 'decimals', 'scale', 'rate', 'defaultCreditLimit', 
    'defaultMaximumBalance', 'created', 'updated']),
  relators: {
    admins: new Relator<Currency,User>(async (currency) => {
      return currency.admin ? [currency.admin] : undefined
    }, UserSerializer, { relatedName: "admins" })
  }
})
export const AccountSerializer = new Serializer<Account>("accounts", {
  version: null,
  projection: projection<Account>(['code', 'balance', 'creditLimit', 
  'maximumBalance', 'created', 'updated']),
  relators: {
    currency: new Relator<Account,Currency>(async (account) => {
      return account.currency
    }, CurrencySerializer, { relatedName: "currency" }),
    users: new Relator<Account,User>(async (account) => {
      return account.users
    }, UserSerializer)
  }
})
export const TransferSerializer = new Serializer<Transfer>("transfers", {
  version: null,
  projection: projection<Transfer>(['state', 'amount', 'meta', 'created', 'updated']),
  relators: {
    payer: new Relator<Transfer,Account>(async (transfer) => {
      return transfer.payer
    }, AccountSerializer, { relatedName: "payer" }),
    payee: new Relator<Transfer,Account>(async (transfer) => {
      return transfer.payee
    }, AccountSerializer, { relatedName: "payee" })
  }
})

export const AccountSettingsSerializer = new Serializer<AccountSettings>("account-settings", {
  version: null,
  projection: projection<AccountSettings>(['acceptPaymentsAutomatically'])
})