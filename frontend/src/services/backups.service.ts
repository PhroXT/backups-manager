import { createCrudService } from "./createCrudService";
import {
    Backup,
    AvailableBackupProjectsResponse,
    AvailableBackupsResponse,
} from "@/src/types/backup";
import { apiFetch } from "@/src/lib/api";

const crud = createCrudService<Backup>("backups");

export const backupsService = {
    ...crud,

    async getAvailableProjects(params?: {
        page?: number;
        pageSize?: number;
        search?: string;
    }) {
        const query = new URLSearchParams();

        if (params?.page !== undefined) {
            query.append("page", String(params.page));
        }

        if (params?.pageSize !== undefined) {
            query.append("pageSize", String(params.pageSize));
        }

        if (params?.search) {
            query.append("search", params.search);
        }

        const queryString = query.toString();

        return apiFetch<AvailableBackupProjectsResponse>(
            `/backups/available${queryString ? `?${queryString}` : ""
            }`
        );
    },

    async getAvailableBackups(
        projectId: string,
        params?: {
            page?: number;
            pageSize?: number;
            search?: string;
        }
    ) {
        const query = new URLSearchParams();

        if (params?.page !== undefined) {
            query.append("page", String(params.page));
        }

        if (params?.pageSize !== undefined) {
            query.append("pageSize", String(params.pageSize));
        }

        if (params?.search) {
            query.append("search", params.search);
        }

        const queryString = query.toString();

        return apiFetch<AvailableBackupsResponse>(
            `/backups/project/${projectId}/available${queryString ? `?${queryString}` : ""
            }`
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