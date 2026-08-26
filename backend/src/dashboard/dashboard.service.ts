import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class DashboardService {

    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: StorageService,
    ) { }

    async getStats() {

        const [
            activeProjects,
            totalBackups,
        ] = await Promise.all([
            this.prisma.project.count({
                where: {
                    enabled: true,
                },
            }),

            this.prisma.backup.count({
                where: {
                    status: 'completed',
                },
            }),
        ]);

        const storageBytes =
            await this.storage.getBucketSize('backups');

        return {
            projects: activeProjects,
            backups: totalBackups,
            storageBytes,
        };
    }
}