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
