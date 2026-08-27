-- DropForeignKey
ALTER TABLE "Backup" DROP CONSTRAINT "Backup_projectId_fkey";

-- AddForeignKey
ALTER TABLE "Backup" ADD CONSTRAINT "Backup_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
