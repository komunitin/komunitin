import { Prisma, PrismaClient } from "@prisma/client";

export type PrivilegedPrismaClient = ReturnType<typeof privilegedDb>
export type TenantPrismaClient = ReturnType<typeof tenantDb>

export function privilegedDb(prisma: PrismaClient) {
  return prisma.$extends(bypassRLS())
}

export function tenantDb(prisma: PrismaClient, tenantId: string) {
  return prisma.$extends(forTenant(tenantId))
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
        $allOperations: async ({ args, query }) => {
          const [, result] = await prisma.$transaction([
            prisma.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, TRUE)`,
            query(args),
          ]);
          return result;
        },
      },
    })
  );
}
