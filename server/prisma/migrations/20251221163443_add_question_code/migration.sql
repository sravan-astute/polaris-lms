/*
  Warnings:

  - The `status` column on the `questions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `options` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `data` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "options" DROP CONSTRAINT "options_question_id_fkey";

-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "approved_by_id" TEXT,
ADD COLUMN     "data" JSONB NOT NULL,
ADD COLUMN     "reviewed_by_id" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT';

-- DropTable
DROP TABLE "options";

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
