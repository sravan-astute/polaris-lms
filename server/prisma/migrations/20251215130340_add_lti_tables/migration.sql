/*
  Warnings:

  - You are about to drop the column `lti_consumer_key` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `lti_secret` on the `organizations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "lti_consumer_key",
DROP COLUMN "lti_secret",
ADD COLUMN     "lti_auth_url" TEXT,
ADD COLUMN     "lti_client_id" TEXT,
ADD COLUMN     "lti_issuer" TEXT,
ADD COLUMN     "lti_keyset_url" TEXT,
ADD COLUMN     "lti_token_url" TEXT;

-- CreateTable
CREATE TABLE "lti_keys" (
    "id" TEXT NOT NULL,
    "kid" TEXT NOT NULL,
    "public_key" TEXT NOT NULL,
    "private_key" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL DEFAULT 'RS256',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lti_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lti_keys_kid_key" ON "lti_keys"("kid");
