-- AlterTable
ALTER TABLE "Question" ADD COLUMN "externalId" TEXT NOT NULL DEFAULT gen_random_uuid()::text;

-- Drop the temporary default; future inserts must supply externalId explicitly.
ALTER TABLE "Question" ALTER COLUMN "externalId" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Question_externalId_key" ON "Question"("externalId");
