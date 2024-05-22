import { PrismaClient } from "@prisma/client";
import { privilegedDb } from "src/controller/multitenant";
import { logger } from "src/utils/logger";

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