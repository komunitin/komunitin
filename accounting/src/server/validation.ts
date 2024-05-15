import { body } from "express-validator"

export namespace Validators {
  const jsonApiResource = (path: string) => [
    body(`${path}`).isObject(),
    body(`${path}.type`).isString().notEmpty(),
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
    body(`${path}.defaultDebitLimit`).optional().isInt(),
  ]

  export const isCreateCurrency = (path: string) => [
    ...jsonApiResource(path),
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
    body(`${path}.rate.d`).exists(),
    ...isCurrencyUpdateAttributes(`${path}.attributes`),
  ]

  export const isUpdateCurrency = (path: string) => [
    ...jsonApiResource(path),
    body(`${path}.type`).equals("currencies"),
    body(`${path}.id`).optional().isUUID(), // id optional as currency is identified by route.
    ...isCurrencyUpdateAttributes(`${path}.attributes`),
  ]
}


