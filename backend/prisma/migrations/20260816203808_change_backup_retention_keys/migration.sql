/*
  Warnings:

  - You are about to drop the column `retentionKey` on the `Backup` table. All the data in the column will be lost.
  - You are about to drop the column `retentionType` on the `Backup` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Backup" DROP COLUMN "retentionKey",
DROP COLUMN "retentionType",
ADD COLUMN     "monthlyKey" TEXT,
ADD COLUMN     "weeklyKey" TEXT;
