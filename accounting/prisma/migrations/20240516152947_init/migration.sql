-- CreateTable
CREATE TABLE "Currency" (
    "tenantId" VARCHAR(31) NOT NULL DEFAULT (current_setting('app.current_tenant_id'))::text,
    "id" TEXT NOT NULL,
    "status" VARCHAR(31) NOT NULL DEFAULT 'new',
    "code" VARCHAR(31) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "namePlural" VARCHAR(255) NOT NULL,
    "symbol" VARCHAR(255) NOT NULL,
    "decimals" INTEGER NOT NULL,
    "scale" INTEGER NOT NULL,
    "rateN" INTEGER NOT NULL,
    "rateD" INTEGER NOT NULL,
    "defaultCreditLimit" INTEGER NOT NULL,
    "defaultMaximumBalance" INTEGER,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "encryptionKeyId" VARCHAR(255) NOT NULL,
    "issuerKeyId" VARCHAR(255),
    "creditKeyId" VARCHAR(255),
    "adminKeyId" VARCHAR(255),
    "externalIssuerKeyId" VARCHAR(255),
    "externalTraderKeyId" VARCHAR(255),
    "externalTradesStreamCursor" VARCHAR(255) NOT NULL DEFAULT '0',

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "tenantId" VARCHAR(31) NOT NULL DEFAULT (current_setting('app.current_tenant_id'))::text,
    "id" TEXT NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "keyId" VARCHAR(255) NOT NULL,
    "currencyId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "creditLimit" INTEGER NOT NULL,
    "maximumBalance" INTEGER,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transfer" (
    "tenantId" VARCHAR(31) NOT NULL DEFAULT (current_setting('app.current_tenant_id'))::text,
    "id" TEXT NOT NULL,
    "state" VARCHAR(31) NOT NULL DEFAULT 'new',
    "amount" INTEGER NOT NULL,
    "meta" TEXT NOT NULL,
    "hash" VARCHAR(255),
    "payerId" TEXT NOT NULL,
    "payeeId" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transfer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EncryptedSecret" (
    "tenantId" VARCHAR(31) NOT NULL DEFAULT (current_setting('app.current_tenant_id'))::text,
    "id" TEXT NOT NULL,
    "encryptedSecret" VARCHAR(255) NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "encrypted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EncryptedSecret_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_encryptionKeyId_key" ON "Currency"("encryptionKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_issuerKeyId_key" ON "Currency"("issuerKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_creditKeyId_key" ON "Currency"("creditKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_adminKeyId_key" ON "Currency"("adminKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_externalIssuerKeyId_key" ON "Currency"("externalIssuerKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_externalTraderKeyId_key" ON "Currency"("externalTraderKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_code_key" ON "Account"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Account_keyId_key" ON "Account"("keyId");

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_encryptionKeyId_fkey" FOREIGN KEY ("encryptionKeyId") REFERENCES "EncryptedSecret"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_issuerKeyId_fkey" FOREIGN KEY ("issuerKeyId") REFERENCES "EncryptedSecret"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_creditKeyId_fkey" FOREIGN KEY ("creditKeyId") REFERENCES "EncryptedSecret"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_adminKeyId_fkey" FOREIGN KEY ("adminKeyId") REFERENCES "EncryptedSecret"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_externalIssuerKeyId_fkey" FOREIGN KEY ("externalIssuerKeyId") REFERENCES "EncryptedSecret"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_externalTraderKeyId_fkey" FOREIGN KEY ("externalTraderKeyId") REFERENCES "EncryptedSecret"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_keyId_fkey" FOREIGN KEY ("keyId") REFERENCES "EncryptedSecret"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_payerId_fkey" FOREIGN KEY ("payerId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transfer" ADD CONSTRAINT "Transfer_payeeId_fkey" FOREIGN KEY ("payeeId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
