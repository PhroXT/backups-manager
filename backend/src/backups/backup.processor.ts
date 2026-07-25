import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BackupExecutorService } from './backup-executor.service';
import { PrismaService } from '../prisma/prisma.service';

@Processor('backups')
export class BackupProcessor extends WorkerHost {

    constructor(
        private readonly executor: BackupExecutorService,
        private readonly prisma: PrismaService,
    ) {
        super();
    }

    async process(job: Job) {

        const { backupId } = job.data;


        await this.prisma.backup.update({
            where: {
                id: backupId,
            },
            data: {
                status: 'running',
            },
        });


        try {

            await this.executor.execute(
                backupId
            );


            await this.prisma.backup.update({
                where: {
                    id: backupId,
                },
                data: {
                    status: 'completed',
                },
            });


        } catch (error) {

            const attemptsMade = job.attemptsMade;
            const maxAttempts = job.opts.attempts ?? 1;

            if (attemptsMade + 1 >= maxAttempts) {

                await this.prisma.backup.update({
                    where: {
                        id: backupId,
                    },
                    data: {
                        status: 'failed',
                        errorMessage:
                            error instanceof Error
                                ? error.message
                                : 'Unknown error',
                    },
                });

            }

            throw error;
        }

    }

}