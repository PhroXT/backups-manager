import { PaginatedResponse } from "../interfaces/paginated-response.interface";

export function buildPaginatedResponse<T>(
    items: T[],
    total: number,
    page: number,
    limit: number
): PaginatedResponse<T> {
    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}