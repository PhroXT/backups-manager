import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Queue } from 'bullmq';
import { PaginationService } from '../common/pagination/pagination.service';
import { Prisma } from '@prisma/client';
import { BackupExecutorService } from './backups-executor.service';
import { StorageService } from '../storage/storage.service';
import { AvailableBackupsQueryDto } from './dto/available-backups-query.dto';

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

    async findAvailableBackupProjects(
        query: AvailableBackupsQueryDto,
    ) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 25;
        const search = query.search?.trim();

        const where: Prisma.ProjectWhereInput = search
            ? {
                name: {
                    contains: search,
                    mode: 'insensitive',
                },
            }
            : {};

        const [projects, total] = await Promise.all([
            this.prisma.project.findMany({
                where,
                orderBy: {
                    name: 'asc',
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: {
                    id: true,
                    name: true,
                    type: true,
                },
            }),

            this.prisma.project.count({
                where,
            }),
        ]);

        const projectIds = projects.map(
            (project) => project.id,
        );

        const backupCounts = projectIds.length
            ? await this.prisma.backup.groupBy({
                by: ['projectId'],
                where: {
                    projectId: {
                        in: projectIds,
                    },
                    status: 'completed',
                    filename: {
                        not: null,
                    },
                },
                _count: {
                    _all: true,
                },
            })
            : [];

        const countMap = new Map(
            backupCounts.map((item) => [
                item.projectId,
                item._count._all,
            ]),
        );

        return {
            data: projects.map((project) => ({
                ...project,
                backupCount:
                    countMap.get(project.id) ?? 0,
            })),

            page,

            pageSize,

            total,

            totalPages: Math.ceil(
                total / pageSize,
            ),
        };
    }

    async findAvailableBackupsByProject(
        projectId: string,
        query: AvailableBackupsQueryDto,
    ) {
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 10;
        const search = query.search?.trim();

        const project = await this.prisma.project.findUnique({
            where: {
                id: projectId,
            },
            select: {
                id: true,
                name: true,
            },
        });

        if (!project) {
            return null;
        }

        const where: Prisma.BackupWhereInput = {
            projectId,
            status: 'completed',
            size: { gt: 0, },
            filename: { not: null, },

            ...(search
                ? {
                    filename: {
                        contains: search,
                        mode: 'insensitive',
                    },
                }
                : {}),
        };

        const [backups, total] = await Promise.all([
            this.prisma.backup.findMany({
                where,
                orderBy: {
                    createdAt: 'desc',
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                select: {
                    id: true,
                    filename: true,
                    size: true,
                    createdAt: true,
                },
            }),

            this.prisma.backup.count({
                where,
            }),
        ]);

        return {
            project,

            data: backups.map((backup) => ({
                ...backup,
                size: backup.size?.toString() ?? null,
            })),

            page,

            pageSize,

            total,

            totalPages: Math.ceil(
                total / pageSize,
            ),
        };
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