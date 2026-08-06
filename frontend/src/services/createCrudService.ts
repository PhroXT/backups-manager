import { apiFetch } from "@/src/lib/api";
import { CrudService } from "@/src/types/crud";
import { QueryParams } from "@/src/types/api";

export function createCrudService<T>(
    endpoint: string
): CrudService<T> {

    return {
        async getAll(params: QueryParams) {
            const query = new URLSearchParams();

            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== "") {
                    query.append(key, String(value));
                }
            });

            return apiFetch(
                `/${endpoint}?${query.toString()}`
            );
        },

        async getById(id: string) {
            return apiFetch(
                `/${endpoint}/${id}`
            );
        },

        async create(data: Partial<T>) {
            return apiFetch(
                `/${endpoint}`,
                {
                    method: "POST",
                    body: JSON.stringify(data),
                }
            );
        },

        async update(id: string, data: Partial<T>) {
            return apiFetch(
                `/${endpoint}/${id}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(data),
                }
            );
        },

        async delete(id: string) {
            return apiFetch(
                `/${endpoint}/${id}`,
                {
                    method: "DELETE",
                }
            );
        },
    };
}