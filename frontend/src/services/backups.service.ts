import { createCrudService } from "./createCrudService";
import { Backup, AvailableBackupProject } from "@/src/types/backup";
import { apiFetch } from "@/src/lib/api";

const crud = createCrudService<Backup>("backups");

export const backupsService = {
    ...crud,

    async getAvailableBackups() {
        return apiFetch<AvailableBackupProject[]>(
            "/backups/available"
        );
    },

    async getDownloadUrl(id: string) {
        return apiFetch<{
            filename: string;
            url: string;
        }>(
            `/backups/${id}/download`
        );
    },
};