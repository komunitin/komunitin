/*
  Warnings:

  - The primary key for the `CreditCommonsTrunkwardNode` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "CreditCommonsTrunkwardNode" DROP CONSTRAINT "CreditCommonsTrunkwardNode_pkey",
ADD COLUMN     "tenantId" VARCHAR(31),
ADD CONSTRAINT "CreditCommonsTrunkwardNode_pkey" PRIMARY KEY ("tenantId", "ccNodeName");
