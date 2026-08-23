import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Queue } from 'bullmq';
import { PaginationService } from '../common/pagination/pagination.service';
import { Prisma } from '@prisma/client';
import { BackupExecutorService } from './backups-executor.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class BackupsService {

    constructor(
        private prisma: PrismaService,
        private paginationService: PaginationService,
        @InjectQueue('backups')
        private backupsQueue: Queue,
        private readonly executor: BackupExecutorService,
        private readonly storage: StorageService,
    ) { }

    async create(
        projectId: string,
        retention?: {
            weeklyKey?: string;
            monthlyKey?: string;
        },
    ) {
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
                    weeklyKey: retention?.weeklyKey,
                    monthlyKey: retention?.monthlyKey,
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

    async findActive() {
        return this.prisma.backup.findMany({
            where: {
                status: {
                    in: ['pending', 'running'],
                },
            },
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'asc',
            },
        });
    }

    async cancel(id: string) {

        const backup = await this.prisma.backup.findUnique({
            where: {
                id,
            },
        });

        if (!backup) {
            return null;
        }

        if (
            backup.status !== 'pending' &&
            backup.status !== 'running'
        ) {
            return false;
        }

        if (backup.status === 'pending') {

            const job =
                await this.backupsQueue.getJob(
                    `backup-${backup.id}`,
                );

            if (job) {
                await job.remove();
            }

            await this.prisma.backup.update({
                where: {
                    id: backup.id,
                },
                data: {
                    status: 'cancelled',
                    errorMessage: null,
                    finishedAt: new Date(),
                },
            });

            return true;
        }

        const cancelled =
            this.executor.cancel(backup.id);

        if (!cancelled) {
            return false;
        }

        return true;
    }

    async findRetentionBackups(
        projectId: string,
        weeklyKey?: string,
        monthlyKey?: string,
        excludeId?: string,
    ) {
        if (!weeklyKey && !monthlyKey) {
            return [];
        }
        return this.prisma.backup.findMany({
            where: {
                projectId,
                status: 'completed',
                id: excludeId
                    ? { not: excludeId }
                    : undefined,

                OR: [
                    ...(weeklyKey
                        ? [{ weeklyKey }]
                        : []),

                    ...(monthlyKey
                        ? [{ monthlyKey }]
                        : []),
                ],
            },
        });
    }

    async findAvailableBackups() {
        return this.prisma.project.findMany({
            orderBy: {
                name: 'asc',
            },
            select: {
                id: true,
                name: true,
                type: true,

                backups: {
                    where: {
                        status: 'completed',
                        filename: {
                            not: null,
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                    select: {
                        id: true,
                        filename: true,
                        size: true,
                        createdAt: true,
                    },
                },
            },
        });
    }

    async getDownloadUrl(id: string) {

        const backup = await this.prisma.backup.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                filename: true,
                status: true,
            },
        });

        if (!backup) {
            return null;
        }

        if (
            backup.status !== 'completed' ||
            !backup.filename
        ) {
            return null;
        }

        const exists = await this.storage.fileExists(
            'backups',
            backup.filename,
        );

        if (!exists) {
            return null;
        }

        const url = await this.storage.getDownloadUrl(
            'backups',
            backup.filename,
        );

        return {
            filename: backup.filename,
            url,
        };
    }

}