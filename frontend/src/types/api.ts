export type SortOrder = "asc" | "desc";

export interface QueryParams {
    page: number;
    limit: number;
    search?: string;
    sort?: string;
    order?: SortOrder;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}