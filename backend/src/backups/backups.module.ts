import { Module } from '@nestjs/common';
import { BackupsController } from './backups.controller';
import { BackupsService } from './backups.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BackupExecutorService } from './backups-executor.service';
import { StorageModule } from '../storage/storage.module';
import { BackupRunnerService } from './backups-runner.service';
import { BullModule } from '@nestjs/bullmq';
import { BackupProcessor } from './backups.processor';
import { PaginationModule } from '../common/pagination/pagination.module';
import { BackupRecoveryService } from './backups-recovery.service';
import { BackupReportService } from '../notifications/reports/backup-report.service';
import { SshModule } from '../database/ssh/ssh.module';

@Module({
    imports: [
        PrismaModule,
        StorageModule,
        BullModule.registerQueue({
            name: 'backups',
        }),
        PaginationModule,
        SshModule,
    ],
    controllers: [
        BackupsController,
    ],
    providers: [
        BackupsService,
        BackupExecutorService,
        BackupRunnerService,
        BackupProcessor,
        BackupRecoveryService,
        BackupReportService,
    ],
    exports: [
        BackupsService,
    ],
})

export class BackupsModule { }