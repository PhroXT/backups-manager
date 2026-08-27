-- AlterTable
ALTER TABLE "Backup" ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "lastActivitySize" BIGINT;
