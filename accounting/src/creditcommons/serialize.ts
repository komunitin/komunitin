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
