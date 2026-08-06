import { Injectable } from "@nestjs/common";
import { buildPaginatedResponse } from "../utils/paginated-response";
import { getPagination } from "./pagination.utils";
import { PaginationConfig } from "./pagination.types";
import { PaginationDto } from "../dto/pagination.dto";

@Injectable()
export class PaginationService {

    async paginate<T>(
        model: any,
        query: PaginationDto,
        config: PaginationConfig,
        args: any = {},
    ) {

        const { page, limit, search, sort, order } = query;

        const { skip, take } = getPagination(page, limit);

        const where = search && config.searchableFields?.length
            ? {
                OR: config.searchableFields.map(field => ({
                    [field]: {
                        contains: search,
                        mode: "insensitive",
                    },
                })),
            }
            : args.where;


        const orderBy = sort && config.sortableFields?.includes(sort)
            ? {
                [sort]: order ?? "asc",
            }
            : undefined;


        const [items, total] = await Promise.all([
            model.findMany({
                ...args,
                skip,
                take,
                where,
                orderBy,
            }),
            model.count({
                where,
            }),
        ]);


        return buildPaginatedResponse(
            items,
            total,
            page,
            limit,
        );
    }
}