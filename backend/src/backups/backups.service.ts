import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

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

        console.log('Creating backup for project: ', projectId);

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

    async findAll() {

        const backups = await this.prisma.backup.findMany({
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


        return backups.map((backup) => ({
            ...backup,
            size: backup.size?.toString() ?? null,
        }));

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


        return {
            ...backup,
            size: backup.size?.toString() ?? null,
        };

    }

}