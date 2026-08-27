-- AlterTable
ALTER TABLE "Schedule" ADD COLUMN     "monthlyRetention" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "weeklyRetention" BOOLEAN NOT NULL DEFAULT true;
