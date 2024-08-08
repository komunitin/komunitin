import { Prisma, PrismaClient } from "@prisma/client";

export type PrivilegedPrismaClient = ReturnType<typeof privilegedDb>
export type TenantPrismaClient = ReturnType<typeof tenantDb>

export const GLOBAL_TENANT_ID = "GLOBAL"

export function privilegedDb(prisma: PrismaClient) {
  return prisma.$extends(bypassRLS())
}

export function tenantDb(prisma: PrismaClient, tenantId: string) {
  return prisma.$extends(forTenant(tenantId))
}

export function globalTenantDb(prisma: PrismaClient) {
  return tenantDb(prisma, GLOBAL_TENANT_ID)
}

function bypassRLS() {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        $allOperations: async ({ args, query }) => {
          const [, result] = await prisma.$transaction([
            prisma.$executeRaw`SELECT set_config('app.bypass_rls', 'on', TRUE)`,
            query(args),
          ]);
          return result;
        },
      },
    })
  );
}

function forTenant(tenantId: string) {
  return Prisma.defineExtension((prisma) =>
    prisma.$extends({
      query: {
        // Set the varaible "app.current_tenant_id" in every query
        $allOperations: async ({ args, query }) => {
          const [, result] = await prisma.$transaction([
            prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, TRUE)`,
            query(args),
          ]);
          return result;
        },
      },
      client: {
        // Make the tenantId easily available for the client.
        tenantId: tenantId
      }
    })
  );
}
