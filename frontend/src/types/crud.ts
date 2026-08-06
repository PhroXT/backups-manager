import { PaginatedResponse, QueryParams } from "./api";

export interface CrudService<T, TCreate = Partial<T>, TUpdate = Partial<T>> {
    getAll(params: QueryParams): Promise<PaginatedResponse<T>>;
    getById(id: string): Promise<T>;
    create(data: TCreate): Promise<T>;
    update(id: string, data: TUpdate): Promise<T>;
    delete(id: string): Promise<void>;
}