import { body } from "express-validator"

export namespace CreditCommonsValidators {
  export const isGraft = () => [
    body("data.attributes.ccNodeName").isString(),
    body("data.attributes.lastHash").isString(),
  ]
}