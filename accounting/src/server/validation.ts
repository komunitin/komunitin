import { body } from "express-validator"


export namespace Validators {
  
  const jsonApiAnyResource = (path: string) => [
    body(`${path}.id`).optional().isString().notEmpty(),
  ]
  const jsonApiResource = (path: string, type: string) => [
    ...jsonApiAnyResource(path),
    body(`${path}.type`).optional().isString().equals(type),
  ]

  const jsonApiDoc = (type: string) => [
    ...jsonApiResource("data", type),
    ...jsonApiAnyResource("included.*"),
  ]

  const jsonApiDocArray = (type: string) => [
    body("data").isArray(),
    ...jsonApiResource("data.*", type),
  ]

  const isUpdateCurrencySettingsAttributes = (path: string) => [
    body(`${path}.defaultInitialCreditLimit`).optional().isInt({min: 0}).default(0),
    body(`${path}.defaultInitialMaximumBalance`).optional().isInt({min: 0}),
    body(`${path}.defaultAcceptPaymentsAutomatically`).optional().isBoolean(),
    body(`${path}.defaultAcceptPaymentsWhitelist`).optional().isArray(),
    body(`${path}.defaultAcceptPaymentsAfter`).optional().isInt({min: 0}),
    body(`${path}.defaultOnPaymentCreditLimit`).optional().isInt({min: 0}),
    body(`${path}.defaultAllowPayments`).optional().isBoolean(),
    body(`${path}.defaultAllowPaymentRequests`).optional().isBoolean(),
    body(`${path}.externalTraderCreditLimit`).optional().isInt({min: 0}),
    body(`${path}.externalTraderMaximumBalance`).optional().isInt({min: 0}),
    body(`${path}.defaultAllowExternalPayments`).optional().isBoolean(),
    body(`${path}.defaultAllowExternalPaymentRequests`).optional().isBoolean(),
    body(`${path}.enableExternalPayments`).optional().isBoolean(),
    body(`${path}.enableExternalPaymentRequests`).optional().isBoolean(),
    body(`${path}.defaultAcceptExternalPaymentsAutomatically`).optional().isBoolean(),
    body(`${path}.defaultAllowTagPayments`).optional().isBoolean(),
    body(`${path}.defaultAllowTagPaymentRequests`).optional().isBoolean(),
  ]

  const isUpdateCurrencyAttributes = (path: string) => [
    body(`${path}.code`).optional().isString().trim().matches(/^[A-Z0-9]{4}$/), // code optional as provided in path.
    body(`${path}.name`).optional().isString().trim().notEmpty(),
    body(`${path}.namePlural`).optional().isString().trim().notEmpty(),
    body(`${path}.symbol`).optional().isString().trim().isLength({max: 3, min: 1}),
    body(`${path}.decimals`).optional().isInt({max: 8, min: 0}),
    body(`${path}.scale`).optional().isInt({max: 12, min: 0}),
    body(`${path}.rate.n`).optional().isInt({min: 1}).default(1),
    body(`${path}.rate.d`).optional().isInt({min: 1}).default(1),
  ]

  const isCreateCurrencyAttributesExist = (path: string) => [
    // Mandatory attributes.
    body(`${path}.code`).exists(),
    body(`${path}.name`).exists(),
    body(`${path}.namePlural`).exists(),
    body(`${path}.symbol`).exists(),
    body(`${path}.decimals`).exists(),
    body(`${path}.scale`).exists(),
    body(`${path}.rate`).exists(),
    body(`${path}.rate.n`).exists(),
    body(`${path}.rate.d`).exists(),
    body(`${path}.settings.defaultInitialCreditLimit`).default(0)
  ]

  const isCollectionRelationship = (path: string, name: string, type: string) => [
    body(`${path}.relationships.${name}`).optional(),
    body(`${path}.relationships.${name}.data.*.id`).isString().notEmpty(),
    body(`${path}.relationships.${name}.data.*.type`).equals(type),
  ]

  const isIncludedTypes = (types: string[]) => [
    body("included.*.type").isIn(types),
    body("included.*.id").isString().notEmpty(),
  ]

  export const isCreateCurrency = () => [
    ...jsonApiDoc("currencies"),
    ...isCreateCurrencyAttributesExist("data.attributes"),
    ...isUpdateCurrencyAttributes("data.attributes"),
    ...isCollectionRelationship("data", "admins", "users"),
    ...isIncludedTypes(["users"]),
  ]

  export const isUpdateCurrency = () => [
    ...jsonApiDoc("currencies"),
    body("data.id").optional().isUUID(), // id optional as currency is identified by route.
    ...isUpdateCurrencyAttributes("data.attributes"),
  ]

  export const isUpdateCurrencySettings = () => [
    ...jsonApiDoc("currency-settings"),
    body("data.id").optional().isUUID(), // id optional as currency is identified by route.
    ...isUpdateCurrencySettingsAttributes("data.attributes"),
  ]

  const isUpdateAccountAttibutes = (path: string) => [
    body(`${path}.code`).optional(),
    body(`${path}.maximumBalance`).optional().isInt({min: 0}),
    body(`${path}.creditLimit`).optional().isInt({min: 0}),
  ]

  export const isUpdateAccount = () => [
    ...jsonApiDoc("accounts"),
    body("data.id").optional().isUUID(), // id optional as currency is identified by route.
    ...isUpdateAccountAttibutes("data.attributes")
  ]

  export const isCreateAccount = () => [
    ...jsonApiDoc("accounts"),
    ...isUpdateAccountAttibutes("data.attributes"),
    ...isCollectionRelationship("data", "users", "users"),
    ...isIncludedTypes(["users"]),
  ]

  const isCreateTransferAttributes = (path: string) => [
    body(`${path}.meta`).isString(),
    body(`${path}.amount`).isInt({gt: 0}),
    body(`${path}.state`).isIn(["new", "committed"]),
    body(`${path}.hash`).optional().isString(),
    body(`${path}.authorization`).optional().custom((value, {req}) => {
      return value.type === "tag" && typeof value.value === "string" && value.value.length > 0
    }),
    body(`${path}.created`).optional(),
    body(`${path}.updated`).optional(),
  ]

  const isResourceId = (path: string, type: string) => [
    body(`${path}.data.id`).isUUID(),
    body(`${path}.data.type`).equals(type),
  ]

  const isExternalResourceId = (path: string, type: string) => [
    ...isResourceId(path, type),
    body(`${path}.data.meta.external`).equals("true"),
    body(`${path}.data.meta.href`).isString().notEmpty(),
  ]

  // Resource id that is optionally external
  const isRelatedResourceId = (path: string, type: string) => [
    ...isResourceId(path, type),
    body(`${path}.data.meta.external`).optional().equals("true"),
    body(`${path}.data.meta.href`).optional().isString().notEmpty(),
  ]

  const isCreateTransferRelationships = (path: string) => [
    ...isRelatedResourceId(`${path}.payer`, "accounts"),
    ...isRelatedResourceId(`${path}.payee`, "accounts"),
    ...isOptionalResourceId(`${path}.currency`, "currencies"),
  ]

  export const isCreateTransfer = () => [
    ...jsonApiDoc("transfers"),
    body("data.id").optional().isUUID(), // Support client-defined UUID.
    ...isCreateTransferAttributes("data.attributes"),
    ...isCreateTransferRelationships("data.relationships")
  ]

  export const isCreateTransfers = () => [
    ...jsonApiDocArray("transfers"),
    ...isCreateTransferAttributes("data.*.attributes"),
    ...isCreateTransferRelationships("data.*.relationships")
  ]

  const isUpdateTransferAttributes = (path: string) => [
    body(`${path}.meta`).optional().isString(),
    body(`${path}.amount`).optional().isInt({gt: 0}),
    body(`${path}.hash`).optional().isString(),
    body(`${path}.state`).optional().isIn(["new", "committed", "rejected", "deleted"]),
  ]

  const isOptionalResourceId = (path: string, type: string) => [
    body(`${path}.data.id`).isUUID().optional(),
    body(`${path}.data.type`).equals(type).optional()
  ]

  const isUpdateTransferRelationships = (path: string) => [
    ...isOptionalResourceId(`${path}.payer`, "accounts"),
    ...isOptionalResourceId(`${path}.payee`, "accounts"),
    ...isOptionalResourceId(`${path}.currency`, "currencies"),
  ]

  export const isUpdateTransfer = () => [
    ...jsonApiDoc("transfers"),
    body("data.id").optional().isUUID(), // id optional as currency is identified by route.
    ...isUpdateTransferAttributes("data.attributes"),
    ...isUpdateTransferRelationships("data.relationships")
  ]

  const isUpdateAccountSettingsAttributes = (path: string) => [
    body(`${path}.acceptPaymentsAutomatically`).optional().isBoolean(),
    body(`${path}.acceptPaymentsWhitelist`).optional().isArray(),
    body(`${path}.acceptPaymentsAfter`).optional().isInt({min: 0}),
    body(`${path}.onPaymentCreditLimit`).optional().isInt({min: 0}),
    body(`${path}.allowPayments`).optional().isBoolean(),
    body(`${path}.allowPaymentRequests`).optional().isBoolean(),
    body(`${path}.allowExternalPayments`).optional().isBoolean(),
    body(`${path}.allowExternalPaymentRequests`).optional().isBoolean(),
    body(`${path}.acceptExternalPaymentsAutomatically`).optional().isBoolean(),
    body(`${path}.allowTagPayments`).optional().isBoolean(),
    body(`${path}.allowTagPaymentRequests`).optional().isBoolean(),
    body(`${path}.tags`).optional().isArray(),
    body(`${path}.tags.*.name`).isString().notEmpty(),
    body(`${path}.tags.*.value`).optional().isString().notEmpty(),
    body(`${path}.tags.*.id`).optional().isUUID(),
  ]

  export const isUpdateAccountSettings = () => [
    ...jsonApiDoc("account-settings"),
    body("data.id").optional().isUUID(), // id optional as currency is identified by route.
    ...isUpdateAccountSettingsAttributes("data.attributes"),
  ]

  const isCreateMigrationAttributes = (path: string) => [
    body(`${path}.code`).isString().notEmpty(),
    body(`${path}.source.url`).isString().notEmpty(),
    body(`${path}.source.platform`).isString().notEmpty(),
    body(`${path}.source.access_token`).isString().notEmpty(),
  ]
  export const isCreateMigration = () => [
    ...jsonApiDoc("migrations"),
    ...isCreateMigrationAttributes("data.attributes"),
  ]

  export const isUpdateTrustline = () => [
    ...jsonApiDoc("trustlines"),
    body("data.id").optional().isUUID(),
    body("data.attributes.limit").isInt({min: 0}),
  ]

  export const isCreateTrustline = () => [
    ...isUpdateTrustline(),
    ...isExternalResourceId("data.relationships.trusted", "currencies"),
  ]
}