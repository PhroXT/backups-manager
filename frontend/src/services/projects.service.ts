import { apiFetch } from "@/src/lib/api";
import { Project } from "@/src/types/project";
import { Paginated } from "@/src/types/pagination";

export const projectsService = {

    getAll(params: {
        page?: number;
        limit?: number;
        search?: string;
        sort?: string;
        order?: string;
    } = {}) {

        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined) {
                query.append(key, String(value));
            }
        });

        return apiFetch<Paginated<Project>>(
            `/projects?${query.toString()}`
        );
    },


    create(data: Partial<Project>) {

        return apiFetch<Project>(
            "/projects",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

    },


    testConnection(id: string) {

        return apiFetch(
            `/projects/${id}/test-connection`,
            {
                method: "POST",
            }
        );

    },

};