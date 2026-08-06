import { PaginatedResponse } from "../interfaces/paginated-response.interface";

export async function paginate<T>(
    model: any,
    params: {
        page: number;
        limit: number;
    },
    options: {
        where?: any;
        include?: any;
        orderBy?: any;
    } = {},
): Promise<PaginatedResponse<T>> {

    const {
        page,
        limit,
    } = params;

    const skip = (page - 1) * limit;

    const [
        items,
        total,
    ] = await Promise.all([
        model.findMany({
            skip,
            take: limit,
            where: options.where,
            include: options.include,
            orderBy: options.orderBy,
        }),

        model.count({
            where: options.where,
        }),
    ]);

    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}