import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { BackupExecutorService } from './backup-executor.service';

@Processor('backups')
export class BackupProcessor extends WorkerHost {

    constructor(
        private readonly executor: BackupExecutorService,
    ) {
        super();
    }

    async process(job: Job) {

        const { backupId } = job.data;

        await this.executor.execute(backupId);
    }
}