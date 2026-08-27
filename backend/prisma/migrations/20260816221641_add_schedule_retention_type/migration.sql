/*
  Warnings:

  - You are about to drop the column `monthlyRetention` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `weeklyRetention` on the `Schedule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Schedule" DROP COLUMN "monthlyRetention",
DROP COLUMN "weeklyRetention",
ADD COLUMN     "retentionType" TEXT NOT NULL DEFAULT 'weekly';
