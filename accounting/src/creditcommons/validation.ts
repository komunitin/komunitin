import { body } from "express-validator"

export namespace CreditCommonsValidators {
  export const isGraft = () => [
    body("data.attributes.ccNodeName").isString(),
    body("data.attributes.lastHash").isString(),
  ]
  export const isTransaction = () => [
    body("data.attributes.cheat").isString(),
    body("data.attributes.uuid").isString(),
    body("data.attributes.state").isString(),
    body("data.attributes.workflow").isString(),
    body("data.attributes.entries").isArray(),
  ]
}