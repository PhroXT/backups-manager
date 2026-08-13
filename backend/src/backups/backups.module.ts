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

@Module({
    imports: [
        PrismaModule,
        StorageModule,
        BullModule.registerQueue({
            name: 'backups',
        }),
        PaginationModule,
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
    ],
    exports: [
        BackupsService,
    ],
})

export class BackupsModule { }