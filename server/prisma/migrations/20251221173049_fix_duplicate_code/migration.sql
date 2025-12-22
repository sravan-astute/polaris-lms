/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `questions` will be added. If there are existing duplicate values, this will fail.
  - The required column `code` was added to the `questions` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "questions" ADD COLUMN     "code" TEXT NOT NULL,
ALTER COLUMN "data" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "questions_code_key" ON "questions"("code");
