import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PaginationQueryDto } from "../dto/pagination-query.dto";
import { PaginatedResponse } from "../interfaces/paginated-response.interface";
import { buildPaginatedResponse } from "../utils/paginated-response";

@Injectable()
export class PaginationService {

    async paginate<T>(
        model: any,
        query: PaginationQueryDto,
        args?: {
            where?: Prisma.Enumerable<any>;
            orderBy?: any;
        },
    ): Promise<PaginatedResponse<T>> {

        const { page, limit } = query;

        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            model.findMany({
                ...args,
                skip,
                take: limit,
            }),
            model.count({
                where: args?.where,
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