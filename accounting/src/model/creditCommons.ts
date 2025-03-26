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
  uuid: string,
  state: string,
  workflow: string,
  entries: CreditCommonsEntry[]
}
