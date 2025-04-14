export const generateCcTransaction = (uuid: string = '3d8ebb9f-6a29-42cb-9d39-9ee0a6bf7f1c') => ({
  uuid,
  state: 'V',
  workflow: '|P-PC+CX+',
  entries: [
      {
      payee: `trunk/branch2/TEST0002`,
      payer: 'trunk/branch/twig/alice',
      quant: 14,
      description: 'test long distance for 3 from leaf',
      metadata: { foo: 'bar' }
      },
      {
      payee: 'trunk/branch/twig/admin',
      payer: `trunk/branch2/TEST0002`,
      quant: 2,
      description: 'Payee fee of 1 to twig/admin',
      metadata: {}
      },
      {
      payee: 'trunk/branch/admin',
      payer: `trunk/branch2/TEST0002`,
      quant: 3,
      description: 'Payee fee of 1 to branch/admin',
      metadata: {}
      },
      {
      payee: 'trunk/admin',
      payer: `trunk/branch2/TEST0002`,
      quant: 1,
      description: 'Payee fee of 1 to trunk/admin',
      metadata: {}
      }
  ]
})
