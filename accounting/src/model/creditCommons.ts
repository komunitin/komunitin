export interface CreditCommonsNode {
  ccNodeName: string,
  lastHash: string,
}

export interface CreditCommonsEntry {
  payer: string,
  payee: string,
  quant: number,
  description: string,
  metadata: { [key: string]: string }
}

export interface CreditCommonsTransaction {
  cheat: string, // to tell the controller which admin account was created during the test setup
  uuid: string,
  state: string,
  workflow: string,
  entries: CreditCommonsEntry[]
}
