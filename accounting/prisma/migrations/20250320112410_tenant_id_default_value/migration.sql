-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "tenantId" SET DEFAULT (current_setting('app.current_tenant_id'))::text;

-- AlterTable
ALTER TABLE "AccountTag" ALTER COLUMN "tenantId" SET DEFAULT (current_setting('app.current_tenant_id'))::text;

-- AlterTable
ALTER TABLE "AccountUser" ALTER COLUMN "tenantId" SET DEFAULT (current_setting('app.current_tenant_id'))::text;

-- AlterTable
ALTER TABLE "Currency" ALTER COLUMN "tenantId" SET DEFAULT (current_setting('app.current_tenant_id'))::text;

-- AlterTable
ALTER TABLE "EncryptedSecret" ALTER COLUMN "tenantId" SET DEFAULT (current_setting('app.current_tenant_id'))::text;

-- AlterTable
ALTER TABLE "ExternalResource" ALTER COLUMN "tenantId" SET DEFAULT (current_setting('app.current_tenant_id'))::text;

-- AlterTable
ALTER TABLE "ExternalTransfer" ALTER COLUMN "tenantId" SET DEFAULT (current_setting('app.current_tenant_id'))::text;

-- AlterTable
ALTER TABLE "Transfer" ALTER COLUMN "tenantId" SET DEFAULT (current_setting('app.current_tenant_id'))::text;

-- AlterTable
ALTER TABLE "Trustline" ALTER COLUMN "tenantId" SET DEFAULT (current_setting('app.current_tenant_id'))::text;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "tenantId" SET DEFAULT (current_setting('app.current_tenant_id'))::text;

-- AlterTable
ALTER TABLE "Value" ALTER COLUMN "tenantId" SET DEFAULT (current_setting('app.current_tenant_id'))::text;
