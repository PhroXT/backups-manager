import { PrismaService } from '../../prisma/prisma.service';
import { PaginationDto } from '../dto/pagination.dto';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';


export abstract class BaseCrudService<T> {

    constructor(
        protected readonly prisma: PrismaService,
    ) { }


    protected async paginate(
        model: any,
        params: PaginationDto,
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
}