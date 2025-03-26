/*
  Warnings:

  - A unique constraint covering the columns `[id,tenantId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
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
    "vostroId" TEXT NOT NULL,

    CONSTRAINT "CreditCommonsNode_pkey" PRIMARY KEY ("tenantId","ccNodeName")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_id_tenantId_key" ON "Account"("id", "tenantId");

-- AddForeignKey
ALTER TABLE "CreditCommonsNode" ADD CONSTRAINT "CreditCommonsNode_vostroId_tenantId_fkey" FOREIGN KEY ("vostroId", "tenantId") REFERENCES "Account"("id", "tenantId") ON DELETE RESTRICT ON UPDATE CASCADE;
