/*
  Warnings:

  - You are about to drop the column `mediaUrl` on the `options` table. All the data in the column will be lost.
  - You are about to drop the column `lti_consumer_key` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `lti_secret` on the `organizations` table. All the data in the column will be lost.
  - You are about to drop the column `order_index` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `quiz_id` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `lti_user_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `attempts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[access_code]` on the table `quizzes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `organizations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `domain` on table `organizations` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `creator_id` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `questions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `questions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `organization_id` to the `quizzes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Made the column `full_name` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `organization_id` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'TEACHER', 'STUDENT');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER', 'MULTIPLE_SELECT', 'FILL_IN_THE_BLANK', 'MATCHING', 'MATH_RESPONSE', 'ORDERING');

-- DropForeignKey
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "attempts" DROP CONSTRAINT "attempts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "questions" DROP CONSTRAINT "questions_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_role_id_fkey";

-- DropIndex
DROP INDEX "users_lti_user_id_key";

-- AlterTable
ALTER TABLE "options" DROP COLUMN "mediaUrl",
ADD COLUMN     "matchText" TEXT,
ADD COLUMN     "sortOrder" INTEGER,
ALTER COLUMN "is_correct" DROP DEFAULT;

-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "lti_consumer_key",
DROP COLUMN "lti_secret",
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "domain" SET NOT NULL;

-- AlterTable
ALTER TABLE "questions" DROP COLUMN "order_index",
DROP COLUMN "quiz_id",
ADD COLUMN     "bloomsTaxonomy" TEXT,
ADD COLUMN     "calculator" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creator_id" TEXT NOT NULL,
ADD COLUMN     "difficulty" TEXT NOT NULL,
ADD COLUMN     "dokLevel" TEXT,
ADD COLUMN     "explanation" TEXT,
ADD COLUMN     "gradeLevels" TEXT[],
ADD COLUMN     "mediaAltText" TEXT,
ADD COLUMN     "organization_id" TEXT NOT NULL,
ADD COLUMN     "standards" TEXT[],
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "subject" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "QuestionType" NOT NULL;

-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN     "access_code" TEXT,
ADD COLUMN     "organization_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "lti_user_id",
DROP COLUMN "role_id",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'TEACHER',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "full_name" SET NOT NULL,
ALTER COLUMN "organization_id" SET NOT NULL;

-- DropTable
DROP TABLE "attempts";

-- DropTable
DROP TABLE "roles";

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "quiz_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "points" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_questions_quiz_id_question_id_key" ON "quiz_questions"("quiz_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_access_code_key" ON "quizzes"("access_code");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
