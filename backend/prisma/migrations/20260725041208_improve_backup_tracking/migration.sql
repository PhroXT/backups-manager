/*
  Warnings:

  - Made the column `updatedAt` on table `Backup` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Backup" ALTER COLUMN "updatedAt" SET NOT NULL;
