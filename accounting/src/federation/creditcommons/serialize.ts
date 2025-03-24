import { Linker, Metaizer, Relator, Serializer, SerializerOptions } from 'ts-japi';
import { CreditCommonsTrunkwardNode, CreditCommonsTransaction } from 'src/model/creditCommons';
import { projection } from 'src/server/serialize';

export const CreditCommonsTrunkwardNodeSerializer = new Serializer<CreditCommonsTrunkwardNode>("creditCommonsTrunkwardNodes", {
    version: null,
    projection: projection<CreditCommonsTrunkwardNode>(['ccNodeName', 'lastHash']),
  })
  
  export const CreditCommonsTransactionSerializer = new Serializer<CreditCommonsTransaction>("creditCommonsTransactions", {
    version: null,
    projection: projection<CreditCommonsTransaction>(['payer', 'payee', 'quant']),
  })

  export const CreditCommonsMessageSerializer = new Serializer<{ message: string }>("message", {
    version: null,
    projection: projection<{ message: string }>(['message']),
  })
