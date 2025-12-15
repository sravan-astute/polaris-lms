/*
  Warnings:

  - You are about to drop the `attempt_answers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `courses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quiz_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quizzes` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[lti_user_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "attempt_answers" DROP CONSTRAINT "attempt_answers_attempt_id_fkey";

-- DropForeignKey
ALTER TABLE "attempt_answers" DROP CONSTRAINT "attempt_answers_question_id_fkey";

-- DropForeignKey
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_questions" DROP CONSTRAINT "quiz_questions_question_id_fkey";

-- DropForeignKey
ALTER TABLE "quiz_questions" DROP CONSTRAINT "quiz_questions_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "quizzes" DROP CONSTRAINT "quizzes_course_id_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "password" TEXT;

-- DropTable
DROP TABLE "attempt_answers";

-- DropTable
DROP TABLE "attempts";

-- DropTable
DROP TABLE "courses";

-- DropTable
DROP TABLE "questions";

-- DropTable
DROP TABLE "quiz_questions";

-- DropTable
DROP TABLE "quizzes";

-- CreateIndex
CREATE UNIQUE INDEX "users_lti_user_id_key" ON "users"("lti_user_id");
