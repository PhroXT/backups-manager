import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BackupRecoveryService {

    private readonly logger =
        new Logger(BackupRecoveryService.name);

    private readonly recoveryThresholdMs =
        5 * 60 * 1000;

    constructor(
        private readonly prisma: PrismaService,

        @InjectQueue('backups')
        private readonly backupsQueue: Queue,
    ) { }

    @Cron('* * * * *')
    async recoverAbandonedBackups() {

        const threshold =
            new Date(
                Date.now() -
                this.recoveryThresholdMs,
            );

        const backups =
            await this.prisma.backup.findMany({
                where: {
                    OR: [
                        {
                            status: 'pending',
                            createdAt: {
                                lt: threshold,
                            },
                        },
                        {
                            status: 'running',
                            startedAt: {
                                lt: threshold,
                            },
                        },
                    ],
                },
            });

        for (const backup of backups) {

            try {

                const jobId =
                    `backup-${backup.id}`;

                const existingJob =
                    await this.backupsQueue.getJob(
                        jobId,
                    );

                if (existingJob) {

                    const state =
                        await existingJob.getState();

                    if (
                        state === 'active' ||
                        state === 'waiting' ||
                        state === 'delayed'
                    ) {
                        continue;
                    }

                    if (state === 'failed') {
                        await existingJob.remove();
                    }
                }

                const updated =
                    await this.prisma.backup.updateMany({
                        where: {
                            id: backup.id,
                            status: {
                                in: [
                                    'pending',
                                    'running',
                                ],
                            },
                        },
                        data: {
                            status: 'pending',
                            errorMessage:
                                'Backup recovered after an interrupted execution',
                            startedAt: null,
                            finishedAt: null,
                        },
                    });

                if (updated.count === 0) {
                    continue;
                }

                await this.backupsQueue.add(
                    'backup',
                    {
                        backupId: backup.id,
                    },
                    {
                        jobId,

                        attempts: 3,

                        backoff: {
                            type: 'exponential',
                            delay: 10000,
                        },

                        removeOnComplete: true,
                        removeOnFail: false,
                    },
                );

                this.logger.warn(
                    `Recovered abandoned backup ${backup.id}`,
                );

            } catch (error) {

                this.logger.error(
                    `Failed to recover backup ${backup.id}`,
                    error,
                );
            }
        }
    }
}