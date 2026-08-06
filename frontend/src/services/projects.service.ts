import { createCrudService } from "./createCrudService";
import { Project } from "@/src/types/project";
import { apiFetch } from "@/src/lib/api";

const crud = createCrudService<Project>("projects");

export const projectsService = {
    ...crud,

    testConnection(id: string) {
        return apiFetch(
            `/projects/${id}/test-connection`,
            {
                method: "POST",
            }
        );
    },

    runBackup(id: string) {
        return apiFetch(
            `/backups/project/${id}`,
            {
                method: "POST",
            }
        );
    },
};