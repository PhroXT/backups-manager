import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { PaginationDto } from '../dto/pagination.dto';
import { Queue } from 'bullmq';
import { Prisma } from '@prisma/client';
import { paginate } from '../common/utils/paginate';

@Injectable()
export class BackupsService {

    constructor(
        private prisma: PrismaService,

        @InjectQueue('backups')
        private backupsQueue: Queue,
    ) { }

    async create(projectId: string) {
        const backup = await this.prisma.backup.create({
            data: {
                projectId,
                filename: 'pending.dump',
                status: 'pending',
            },
        });

        await this.backupsQueue.add(
            'backup',
            {
                backupId: backup.id,
            },
            {
                attempts: 3,

                backoff: {
                    type: 'exponential',
                    delay: 10000,
                },

                removeOnComplete: true,
                removeOnFail: false,
            },
        );

        return backup;

    }

    async findAll(params: PaginationDto) {

        const {
            search,
            sort,
            order,
        } = params;


        const where: Prisma.BackupWhereInput = search
            ? {
                OR: [
                    {
                        filename: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        project: {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    },
                ],
            }
            : {};


        const allowedSorts = [
            "filename",
            "size",
            "status",
            "createdAt",
        ];


        const orderBy = sort && allowedSorts.includes(sort)
            ? {
                [sort]: order ?? "asc",
            }
            : {
                createdAt: "desc",
            };


        return paginate(
            this.prisma.backup,
            params,
            {
                where,

                include: {
                    project: true,
                },

                orderBy,
            },
        );
    }

    async findOne(id: string) {

        const backup = await this.prisma.backup.findUnique({
            where: {
                id,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        if (!backup) {
            return null;
        }

        return backup;

    }

}