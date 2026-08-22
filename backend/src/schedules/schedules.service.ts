import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/pagination/pagination.service';

@Injectable()
export class SchedulesService {
    async findAll(query: PaginationDto) {

        return this.paginationService.paginate(
            this.prisma.schedule,
            query,
            {
                searchableFields: [
                    'cron',
                    'retentionType',
                    'project.name',
                ],

                sortableFields: [
                    'cron',
                    'retentionType',
                    'enabled',
                    'lastRun',
                    'createdAt',
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

    constructor(
        private readonly prisma: PrismaService,
        private readonly paginationService: PaginationService,
    ) { }

    async findEnabled() {

        return this.prisma.schedule.findMany({
            where: {
                enabled: true,
            },
            include: {
                project: true,
            },
        });

    }

    async updateLastRun(id: string) {

        return this.prisma.schedule.update({
            where: {
                id,
            },
            data: {
                lastRun: new Date(),
            },
        });

    }

    async create(data: {
        projectId: string;
        cron: string;
        retentionType: string;
    }) {
        return this.prisma.schedule.create({
            data: {
                projectId: data.projectId,
                cron: data.cron,
                retentionType: data.retentionType,
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
    }

    async toggleEnabled(id: string) {
        const schedule = await this.prisma.schedule.findUnique({
            where: { id },
        });

        if (!schedule) {
            throw new Error('Schedule not found');
        }

        return this.prisma.schedule.update({
            where: { id },
            data: {
                enabled: !schedule.enabled,
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
    }

    async update(
        id: string,
        data: {
            projectId: string;
            cron: string;
            retentionType: string;
        },
    ) {
        return this.prisma.schedule.update({
            where: {
                id,
            },
            data: {
                projectId: data.projectId,
                cron: data.cron,
                retentionType: data.retentionType,
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
    }

    async remove(id: string) {
        return this.prisma.schedule.delete({
            where: {
                id,
            },
        });
    }
}