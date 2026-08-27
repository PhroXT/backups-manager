CREATE UNIQUE INDEX "Backup_project_active_unique"
ON "Backup" ("projectId")
WHERE "status" IN ('pending', 'running');