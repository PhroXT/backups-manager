import { Module } from '@nestjs/common';
import { BackupsController } from './backups.controller';
import { BackupsService } from './backups.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BackupExecutorService } from './backup-executor.service';
import { StorageModule } from '../storage/storage.module';
import { BackupRunnerService } from './backup-runner.service';
import { BullModule } from '@nestjs/bullmq';
import { BackupProcessor } from './backup.processor';

@Module({
    imports: [
        PrismaModule,
        StorageModule,
        BullModule.registerQueue({
            name: 'backups',
        }),
    ],
    controllers: [
        BackupsController,
    ],
    providers: [
        BackupsService,
        BackupExecutorService,
        BackupRunnerService,
        BackupProcessor,
    ],

})

export class BackupsModule { }