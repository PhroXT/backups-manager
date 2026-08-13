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
        //60 * 60 * 1000;
        5 * 1000;

    constructor(
        private readonly prisma: PrismaService,

        @InjectQueue('backups')
        private readonly backupsQueue: Queue,
    ) { }

    @Cron('*/10 * * * *')
    async recoverAbandonedBackups() {

        const threshold =
            new Date(
                Date.now() -
                this.recoveryThresholdMs,
            );

        const backups =
            await this.prisma.backup.findMany({
                where: {
                    status: 'running',
                    startedAt: {
                        lt: threshold,
                    },
                },
            });

        for (const backup of backups) {

            try {

                const jobs =
                    await this.backupsQueue.getJobs([
                        'active',
                        'waiting',
                        'delayed',
                    ]);

                const existingJob =
                    jobs.find(
                        job =>
                            job.data?.backupId === backup.id,
                    );

                if (existingJob) {
                    continue;
                }

                await this.prisma.backup.update({
                    where: {
                        id: backup.id,
                    },
                    data: {
                        status: 'pending',
                        errorMessage:
                            'Backup recovered after an interrupted execution',
                        finishedAt: null,
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