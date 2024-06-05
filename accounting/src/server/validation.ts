import { body } from "express-validator"

export namespace Validators {
  
  const jsonApiAnyResource = (path: string) => [
    body(`${path}.id`).optional().isString().notEmpty(),
    body(`${path}.attributes.id`).not().exists(),
    body(`${path}.attributes.type`).not().exists(),
  ]
  const jsonApiResource = (path: string, type: string) => [
    ...jsonApiAnyResource(path),
    body(`${path}.type`).optional().isString().equals(type),
  ]

  const jsonApiDoc = (type: string) => [
    ...jsonApiResource("data", type),
    ...jsonApiAnyResource("included.*"),
  ]

  const isUpdateCurrencySettings = (path: string) => [
    body(`${path}`).optional(),
    body(`${path}.defaultInitialCreditLimit`).optional().isInt({min: 0}).default(0),
    body(`${path}.defaultInitialMaximumBalance`).optional().isInt({min: 0}),
    body(`${path}.defaultAcceptPaymentsAutomatically`).optional().isBoolean(),
    body(`${path}.defaultAcceptPaymentsWhitelist`).optional().isArray(),
    body(`${path}.defaultAcceptPaymentsAfter`).optional().isInt({min: 0}),
    body(`${path}.defaultOnPaymentCreditLimit`).optional().isInt({min: 0}),
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
    ...isUpdateCurrencySettings(`${path}.settings`),
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
    ...isUpdateCurrencyAttributes(`data.attributes`),
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
    ...isCollectionRelationship("data", "users", "users"),
    ...isIncludedTypes(["users"]),
  ]

  const isCreateTransferAttributes = (path: string) => [
    body(`${path}.meta`).isString(),
    body(`${path}.amount`).isInt({gt: 0}),
    body(`${path}.state`).isIn(["new", "committed"]),
  ]

  const isResourceId = (path: string, type: string) => [
    body(`${path}.data.id`).isUUID(),
    body(`${path}.data.type`).equals(type),
  ]

  const isCreateTransferRelationships = (path: string) => [
    ...isResourceId(`${path}.payer`, "accounts"),
    ...isResourceId(`${path}.payee`, "accounts"),
  ]

  export const isCreateTransfer = () => [
    ...jsonApiDoc("transfers"),
    body("data.id").optional().isUUID(), // Support client-defined UUID.
    ...isCreateTransferAttributes("data.attributes"),
    ...isCreateTransferRelationships("data.relationships")
  ]

  const isUpdateTransferAttributes = (path: string) => [
    body(`${path}.meta`).optional().isString(),
    body(`${path}.amount`).optional().isInt({gt: 0}),
    body(`${path}.state`).optional().isIn(["new", "committed", "rejected", "deleted"]),
  ]

  const isOptionalResourceId = (path: string, type: string) => [
    body(`${path}`).optional(),
    body(`${path}.data.id`).if(body(`${path}`).exists()).isUUID(),
    body(`${path}.data.type`).if(body(`${path}`).exists()).equals(type),
  ]

  const isUpdateTransferRelationships = (path: string) => [
    body(path).optional(),
    ...isOptionalResourceId(`${path}.payer`, "accounts"),
    ...isOptionalResourceId(`${path}.payee`, "accounts"),
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
  ]

  export const isUpdateAccountSettings = () => [
    ...jsonApiDoc("account-settings"),
    body("data.id").optional().isUUID(), // id optional as currency is identified by route.
    ...isUpdateAccountSettingsAttributes("data.attributes"),
  ]

}


