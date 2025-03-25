export interface CreditCommonsNode {
  ccNodeName: string,
  lastHash: string,
}

export interface CreditCommonsTransaction {
  payer: string,
  payee: string,
  quant: number,
  description: string,
  workflow: string,
  metadata: {
    payer_name?: string,
    inside_leg?: number,
    category?: string,
  }
}
