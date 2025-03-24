import { body } from "express-validator"

export namespace CreditCommonsValidators {
  export const isGraft = () => [
    body("data.attributes.ccNodeName").isString(),
    body("data.attributes.lastHash").isString(),
  ]
  export const isTransaction = () => [
    body("data.attributes.payer").isString(),
    body("data.attributes.payee").isString(),
    body("data.attributes.quant").isNumeric(),
  ]
}