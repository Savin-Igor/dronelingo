-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'ACTIVATED', 'CANCELLED');

-- CreateTable
CREATE TABLE "InvoiceRequest" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "reference" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "accessToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),

    CONSTRAINT "InvoiceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceRequest_reference_key" ON "InvoiceRequest"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceRequest_accessToken_key" ON "InvoiceRequest"("accessToken");

-- CreateIndex
CREATE INDEX "InvoiceRequest_email_idx" ON "InvoiceRequest"("email");

-- CreateIndex
CREATE INDEX "InvoiceRequest_status_idx" ON "InvoiceRequest"("status");
