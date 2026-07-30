import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulesService {

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
}