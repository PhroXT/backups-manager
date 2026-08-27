/*
  Warnings:

  - Added the required column `updatedAt` to the `Backup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Backup" ADD COLUMN     "errorMessage" TEXT,
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3),
ALTER COLUMN "filename" DROP NOT NULL;
