import { PrismaClient } from "@prisma/client";
import { privilegedDb, tenantDb } from "src/controller/multitenant";
import { logger } from "src/utils/logger";


export const pseudoRandomGenerator = (seed: number = 12032025) => {
  // Knuth's multiplicative hash function
  // for a 32-bit integer
  const hash = (x: number) => {
    return (x * 2654435761) % 2**32
  }
  /**
   * returns a pesudo-random integer between min and max using Knuth's 
   * multiplicative hash function.
   * @param min 
   * @param max 
   */  
  return (min: number, max: number) => {
    seed = hash(seed)
    const scaled = seed / 2**32  // between 0 and 1
    return Math.floor(min + scaled * (max - min))  // between min and max
  }
}

export async function clearDb() {
  const client = privilegedDb(new PrismaClient())
  await client.$connect()
  //https://www.prisma.io/docs/orm/prisma-client/queries/crud#deleting-all-data-with-raw-sql--truncate
  const tablenames = await client.$queryRaw<
    Array<{ tablename: string }>
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`

  const tables = tablenames
    .map(({ tablename }) => tablename)
    .filter((name) => name !== '_prisma_migrations')
    .map((name) => `"public"."${name}"`)
    .join(', ')

  await client.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`)
  await client.$disconnect()
  logger.info("Database cleared")
}

/**
 * Creates n random local transactions between accounts of the given tenant.
 * This function directly creates the transfer records in the DB without
 * updating balances or checking conditions.
 * @param tenantId 
 * @param n 
 */
export async function seedTransfers(tenantId: string, n: number, start: Date, end: Date) {
  const client = tenantDb(new PrismaClient(), tenantId)
  await client.$connect()
  const r = pseudoRandomGenerator()
  const accounts = await client.account.findMany()
  
  for (let i = 0; i < n; i++) {
    const fromIndex = r(0, accounts.length)
    let toIndex
    do {
      toIndex = r(0, accounts.length)
    } while (toIndex === fromIndex)
    const amount = r(10, 1000)*100
    const text = `Transaction ${i}`
    const created = new Date(r(start.getTime(), end.getTime()))
    const transfer = await client.transfer.create({
      data: {
        amount,
        payerId: accounts[fromIndex].id,
        payeeId: accounts[toIndex].id,
        meta: text,
        userId: "0",
        state: r(0, 10) > 0 ? "committed" : "rejected",
        created,
        updated: created,
        hash: `hash-${i}`
      }
    })
  }
}