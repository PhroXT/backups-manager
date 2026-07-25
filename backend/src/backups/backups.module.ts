import { Module } from '@nestjs/common';
import { BackupsController } from './backups.controller';
import { BackupsService } from './backups.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BackupExecutorService } from './backup-executor.service';
import { StorageModule } from '../storage/storage.module';
import { BackupRunnerService } from './backup-runner.service';

@Module({
    imports: [
        PrismaModule,
        StorageModule,
    ],
    controllers: [
        BackupsController,
    ],
    providers: [
        BackupsService,
        BackupExecutorService,
        BackupRunnerService,
    ],
})
export class BackupsModule { }