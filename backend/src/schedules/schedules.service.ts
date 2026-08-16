import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulesService {
    async findAll() {

        return this.prisma.schedule.findMany({
            include: {
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

    }

    constructor(
        private readonly prisma: PrismaService,
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
}