/*
  Warnings:

  - You are about to drop the column `options` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `orderIndex` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `prompt` on the `questions` table. All the data in the column will be lost.
  - Added the required column `text` to the `questions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_quiz_id_fkey";

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "options",
DROP COLUMN "orderIndex",
DROP COLUMN "prompt",
ADD COLUMN     "mediaType" TEXT,
ADD COLUMN     "mediaUrl" TEXT,
ADD COLUMN     "order_index" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "text" TEXT NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'MULTIPLE_CHOICE';

-- CreateTable
CREATE TABLE "options" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "mediaUrl" TEXT,
    "feedback" TEXT,
    "question_id" TEXT NOT NULL,

    CONSTRAINT "options_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
