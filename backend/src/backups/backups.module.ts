import { Module } from '@nestjs/common';
import { BackupsController } from './backups.controller';
import { BackupsService } from './backups.service';
import { PrismaModule } from '../prisma/prisma.module';
import { BackupExecutorService } from './backup-executor.service';

@Module({
    imports: [
        PrismaModule,
    ],
    controllers: [
        BackupsController,
    ],
    providers: [
        BackupsService,
        BackupExecutorService,
    ],
})
export class BackupsModule { }