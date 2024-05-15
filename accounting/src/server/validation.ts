import { body } from "express-validator"

export namespace Validators {
  const jsonApiResource = (path: string, type: string) => [
    body(`${path}`).isObject(),
    body(`${path}.type`).isString().equals(type),
    body(`${path}.id`).optional().isString().notEmpty(),
    body(`${path}.attributes`).optional().isObject(),
    body(`${path}.attributes.id`).not().exists(),
    body(`${path}.attributes.type`).not().exists(),
    body(`${path}.relationships`).optional().isObject(),
  ]

  const isCurrencyUpdateAttributes = (path: string) => [
    body(`${path}.code`).optional().isString().trim().matches(/^[A-Z0-9]{4}$/), // code optional as provided in path.
    body(`${path}.name`).optional().isString().trim().notEmpty(),
    body(`${path}.namePlural`).optional().isString().trim().notEmpty(),
    body(`${path}.symbol`).optional().isString().trim().isLength({max: 3, min: 1}),
    body(`${path}.decimals`).optional().isInt({max: 8, min: 0}),
    body(`${path}.scale`).optional().isInt({max: 12, min: 0}),
    body(`${path}.rate`).optional().isObject(),
    body(`${path}.rate.n`).optional().isInt({min: 1}).default(1),
    body(`${path}.rate.d`).optional().isInt({min: 1}).default(1),
    body(`${path}.defaultCreditLimit`).optional().isInt({min: 0}).default(0),
    body(`${path}.defaultMaximumBalance`).optional().isInt({min: 0}),
  ]

  const isCurrencyCreateAttributesExist = (path: string) => [
    body(`${path}.type`).equals("currencies"),
    body(`${path}.id`).not().exists(),
    // Mandatory attributes.
    body(`${path}.code`).exists(),
    body(`${path}.name`).exists(),
    body(`${path}.namePlural`).exists(),
    body(`${path}.symbol`).exists(),
    body(`${path}.decimals`).exists(),
    body(`${path}.scale`).exists(),
    body(`${path}.rate`).exists(),
    body(`${path}.rate.n`).exists(),
    body(`${path}.rate.d`).exists()
  ]

  export const isCreateCurrency = () => [
    ...jsonApiResource("data", "currencies"),
    ...isCurrencyCreateAttributesExist("data.attributes"),
    ...isCurrencyUpdateAttributes("data.attributes"),
  ]

  export const isUpdateCurrency = () => [
    ...jsonApiResource("data", "currencies"),
    body("data.id").optional().isUUID(), // id optional as currency is identified by route.
    ...isCurrencyUpdateAttributes(`data.attributes`),
  ]

  const isAccountUpdateAttibutes = (path: string) => [
    body(`${path}.maximumBalance`).optional().isInt({min: 0}),
    body(`${path}.creditLimit`).optional().isInt({min: 0})
  ]

  export const isUpdateAccount = () => [
    ...jsonApiResource("data", "accounts"),
    body("data.id").optional().isUUID(), // id optional as currency is identified by route.
    ...isAccountUpdateAttibutes("data.attributes")
  ]

  const isTransferCreateAttributes = (path: string) => [
    body(`${path}.meta`).isString(),
    body(`${path}.amount`).isInt({gt: 0}),
    body(`${path}.state`).isIn(["new", "committed"]),
  ]

  export const isCreateTransfer = () => [
    ...jsonApiResource("data", "transfers"),
    body("data.id").optional().isUUID(), // Support client-defined UUID.
    ...isTransferCreateAttributes("data.attributes"),
    ...isTransferCreateRelationships("data.relationships")
  ]

  export const isTransferCreateRelationships = (path: string) => [
    body(`${path}.payer.data.id`).isUUID(),
    body(`${path}.payer.data.type`).equals("accounts"),
    body(`${path}.payee.data.id`).isUUID(),
    body(`${path}.payee.data.type`).equals("accounts"),
  ]
}


