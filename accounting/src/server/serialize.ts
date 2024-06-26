import { Metaizer, Relator, Serializer } from 'ts-japi';
import { Account, AccountSettings, Currency, Transfer, User } from '../model';

const projection = <T>(fields: (keyof T)[]) => {
  return Object.fromEntries(fields.map(field => [field, 1]))
}
export const UserSerializer = new Serializer<User>("users", {
  version: null,
  projection: null,
  metaizers: {
    resource: new Metaizer<[User]>(() => ({
      external: true,
      // The user is a resource from the social api. At this point we don't know the
      // url of the social api so we can't generate the href. However this is not 
      // really used so we will just return an empty string.
      href: ""
    }))
  }
})
// JSON:API resource serializers
export const CurrencySerializer = new Serializer<Currency>("currencies", {
  version: null,
  projection: projection<Currency>(['code', 'status', 'name', 'namePlural', 
    'symbol', 'decimals', 'scale', 'rate', 'settings', 'created', 'updated']),
  relators: {
    admins: new Relator<Currency,User>(async (currency) => {
      return currency.admin ? [currency.admin] : undefined
    }, UserSerializer, { relatedName: "admins" })
  }
})

export const AccountSettingsSerializer = new Serializer<AccountSettings>("account-settings", {
  version: null,
  projection: projection<AccountSettings>([
    'acceptPaymentsAutomatically', 
    'acceptPaymentsWhitelist', 
    'acceptPaymentsAfter', 
    'onPaymentCreditLimit',
    'allowPayments',
    'allowPaymentRequests'
  ])
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
    }, UserSerializer),
    settings: new Relator<Account, AccountSettings>(async (account) => {
      return account.settings
    }, AccountSettingsSerializer, { relatedName: "settings" })
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
    }, AccountSerializer, { relatedName: "payee" }),
    currency: new Relator<Transfer,Currency>(async (transfer) => {
      return transfer.payee.currency
    }, CurrencySerializer, { relatedName: "currency" })
  }
})
