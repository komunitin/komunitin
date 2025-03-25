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

-- CreateTable
CREATE TABLE "CreditCommonsNode" (
    "tenantId" VARCHAR(31) NOT NULL DEFAULT (current_setting('app.current_tenant_id'))::text,
    "ccNodeName" VARCHAR(255) NOT NULL,
    "lastHash" VARCHAR(255) NOT NULL,

    CONSTRAINT "CreditCommonsNode_pkey" PRIMARY KEY ("tenantId","ccNodeName")
);

-- Enable Row Level Security
ALTER TABLE "CreditCommonsNode" ENABLE ROW LEVEL SECURITY;

-- Force Row Level Security for table owners
ALTER TABLE "CreditCommonsNode" FORCE ROW LEVEL SECURITY;

-- Create row security policies
CREATE POLICY tenant_isolation_policy ON "CreditCommonsNode" USING ("tenantId" = current_setting('app.current_tenant_id', TRUE)::text);

-- Create policies to bypass RLS
CREATE POLICY bypass_rls_policy ON "CreditCommonsNode" USING (current_setting('app.bypass_rls', TRUE)::text = 'on');
