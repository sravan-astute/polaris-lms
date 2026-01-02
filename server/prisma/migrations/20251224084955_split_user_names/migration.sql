/*
  Warnings:

  - You are about to drop the column `full_name` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "full_name",
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "job_title" TEXT,
ADD COLUMN     "last_name" TEXT;
