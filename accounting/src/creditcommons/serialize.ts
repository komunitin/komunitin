import { Linker, Metaizer, Relator, Serializer, SerializerOptions } from 'ts-japi';
import { CreditCommonsNode, CreditCommonsTransaction } from 'src/model/creditCommons';
import { projection } from 'src/server/serialize';

export const CreditCommonsNodeSerializer = new Serializer<CreditCommonsNode>("creditCommonsNodes", {
  version: null,
  projection: projection<CreditCommonsNode>(['ccNodeName', 'lastHash']),
})

export const CreditCommonsMessageSerializer = new Serializer<{ message: string }>("message", {
  version: null,
  projection: projection<{ message: string }>(['message']),
})

export const CreditCommonsTransactionSerializer = new Serializer<CreditCommonsTransaction>("creditCommonsTransactions", {
  version: null,
  projection: projection<CreditCommonsTransaction>(['uuid', 'state', 'workflow', 'entries']),
})