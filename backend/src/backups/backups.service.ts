import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Queue } from 'bullmq';
import { PaginationService } from '../common/pagination/pagination.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BackupsService {

    constructor(
        private prisma: PrismaService,
        private paginationService: PaginationService,
        @InjectQueue('backups')
        private backupsQueue: Queue,
    ) { }

    async create(projectId: string) {

        const activeBackup = await this.prisma.backup.findFirst({
            where: {
                projectId,
                status: {
                    in: ['pending', 'running'],
                },
            },
        });

        if (activeBackup) {
            return null;
        }

        try {

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
                    jobId: `backup-${backup.id}`,

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

        } catch (error) {

            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === 'P2002'
            ) {
                return null;
            }

            throw error;
        }
    }

    async findAll(query: PaginationDto) {

        return this.paginationService.paginate(
            this.prisma.backup,
            query,
            {
                searchableFields: [
                    "filename",
                    "status",
                    "project.name",
                ],

                sortableFields: [
                    "filename",
                    "size",
                    "status",
                    "createdAt",
                ],
            },
            {
                include: {
                    project: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
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