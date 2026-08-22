import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { NotificationsService } from './notifications.service';
import { NotificationsScheduler } from './notifications.scheduler';
import { BackupReportService } from './reports/backup-report.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [
        PrismaModule,
        TelegramModule,
    ],
    controllers: [
        NotificationsController,
    ],
    providers: [
        NotificationsService,
        NotificationsScheduler,
        BackupReportService,
    ],
    exports: [
        NotificationsService,
        BackupReportService,
    ],
})
export class NotificationsModule { }