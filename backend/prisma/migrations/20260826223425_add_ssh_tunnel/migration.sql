-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "sshEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sshHost" TEXT,
ADD COLUMN     "sshPassword" TEXT,
ADD COLUMN     "sshPort" INTEGER,
ADD COLUMN     "sshUsername" TEXT;
