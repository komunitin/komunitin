import { ExternalResource } from 'src/model/resource';
import { Trustline } from 'src/model/trustline';
import { Linker, Metaizer, Relator, Serializer, SerializerOptions } from 'ts-japi';
import { Account, AccountSettings, Currency, Transfer, User } from '../model';
import { config } from 'src/config';

const projection = <T>(fields: (keyof T)[]) => {
  return Object.fromEntries(fields.map(field => [field, 1]))
}


const externalResourceSerializer = <T>(type: string) => new Serializer<ExternalResource<T> | {id: string}>(type, {
  version: null,
  projection: undefined,
  metaizers: {
    resource: new Metaizer<[ExternalResource<T> | {id: string}]>((resource) => ({
      external: true,
      href: "href" in resource ? resource.href : null
    }))
  }
})



export const UserSerializer = externalResourceSerializer("users")

// JSON:API resource serializers
export const CurrencySerializer = new Serializer<Currency>("currencies", {
  version: null,
  projection: projection<Currency>(['code', 'status', 'name', 'namePlural', 
    'symbol', 'decimals', 'scale', 'rate', 'keys', 'settings', 'created', 'updated']),
  relators: {
    admins: new Relator<Currency,User>(async (currency) => {
      return currency.admin ? [currency.admin] : undefined
    }, UserSerializer, { relatedName: "admins" })
  },
  linkers: {
    resource: new Linker((currency: Currency) => `${config.API_BASE_URL}/${currency.code}/currency`)
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
    'allowPaymentRequests',
    'allowTagPayments',
    'allowTagPaymentRequests',
    'tags',
  ]),
})

export const AccountSerializer = new Serializer<Account>("accounts", {
  version: null,
  projection: projection<Account>(['code', 'balance', 'creditLimit', 
  'maximumBalance', 'key', 'created', 'updated']),
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
  },
  linkers: {
    resource: new Linker((account: Account) => `${config.API_BASE_URL}/${account.currency.code}/accounts/${account.id}`)
  }
})

// Serializer customization to merge "externalPayee" into the "payee" relationship.
class CustomTransferSerializer extends Serializer<Transfer> {
  async serialize(transfer: Transfer|Transfer[], options?: Partial<SerializerOptions<Transfer>>) {
    const omittedAccountIds: string[] = []
    const fixRelationships = (resource: any) => {
      if (resource.relationships?.externalPayee) {
        omittedAccountIds.push(resource.relationships.payee.data.id)
        resource.relationships.payee = resource.relationships.externalPayee
        delete resource.relationships["externalPayee"]
      }
      if (resource.relationships?.externalPayer) {
        omittedAccountIds.push(resource.relationships.payer.data.id)
        resource.relationships.payer = resource.relationships.externalPayer
        delete resource.relationships["externalPayer"]
      }
    }
    
    if (options && options.include && Array.isArray(options.include)) {
      if (options.include.includes("payer")) {
        options.include.push("externalPayer")
      }
      if (options.include.includes("payee")) {
        options.include.push("externalPayee")
      }
    }
    const result = await super.serialize(transfer, options)
    if (result.data && Array.isArray(result.data)) {
      result.data.forEach((resource) => fixRelationships(resource))
    } else if (result.data) {
      fixRelationships(result.data)
    }
    if (result.included) {
      result.included = result.included.filter((resource) => {
        return !omittedAccountIds.includes(resource.id)
      })
    }
    return result
  }
}

export const ExternalAccountSerializer = externalResourceSerializer<Account>("accounts")

export const TransferSerializer = new CustomTransferSerializer("transfers", {
  version: null,
  projection: projection<Transfer>(['state', 'amount', 'meta', 'created', 'updated', 'hash']),
  relators: {
    payer: new Relator<Transfer,Account>(async (transfer) => {
      return transfer.payer
    }, AccountSerializer, { relatedName: "payer" }),
    payee: new Relator<Transfer,Account>(async (transfer) => {
      return transfer.payee
    }, AccountSerializer, { relatedName: "payee" }),
    externalPayee: new Relator<Transfer, ExternalResource<Account>>(async (transfer) => {
      return transfer.externalPayee
    }, ExternalAccountSerializer, { relatedName: "externalPayee" }),
    externalPayer: new Relator<Transfer, ExternalResource<Account>>(async (transfer) => {
      return transfer.externalPayer
    }, ExternalAccountSerializer, { relatedName: "externalPayer" }),
    currency: new Relator<Transfer,Currency>(async (transfer) => {
      return transfer.payee.currency
    }, CurrencySerializer, { relatedName: "currency" })
  },
  linkers: {
    // note that both payer and payee are local in Transfer object.
    resource: new Linker((transfer: Transfer) => `${config.API_BASE_URL}/${transfer.payee.currency.code}/transfers/${transfer.id}`)
  } 
})



const ExternalCurrencySerializer = externalResourceSerializer<Currency>("currencies")

export const TrustlineSerializer = new Serializer<Trustline>("trustlines", {
  version: null,
  projection: projection<Trustline>(['limit', 'balance', 'created', 'updated']),
  relators: {
    currency: new Relator<Trustline,Currency>(async (trustline) => {
      return trustline.currency
    }, CurrencySerializer, { relatedName: "currency" }),
    trusted: new Relator<Trustline, ExternalResource<Currency>>(async (trustline) => trustline.trusted
    , ExternalCurrencySerializer, { relatedName: "trusted" })
  }
})



