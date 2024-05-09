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

  const isCurrencyAttributes = (path: string) => [
    body(`${path}.code`).isString().trim().isLength({max: 4, min: 4}),
    body(`${path}.name`).isString().trim().notEmpty(),
    body(`${path}.namePlural`).isString().trim().notEmpty(),
    body(`${path}.symbol`).isString().trim().isLength({max: 3, min: 1}),
    body(`${path}.decimals`).isInt({max: 8, min: 0}),
    body(`${path}.scale`).isInt({max: 12, min: 0}),
    body(`${path}.value`).isObject(),
    body(`${path}.value.n`).isInt({min: 1}),
    body(`${path}.value.d`).isInt({min: 1}),
    body(`${path}.defaultCreditLimit`).optional().isInt({min: 0}).default(0),
    body(`${path}.defaultDebitLimit`).optional().isInt(),
  ]

  export const isCurrency = (path: string) => [
    ...jsonApiResource(path),
    body(`${path}.type`).equals("currencies"),
    body(`${path}.id`).optional().isUUID(),
    ...isCurrencyAttributes(`${path}.attributes`),
  ]
}

