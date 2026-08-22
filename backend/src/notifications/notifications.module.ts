import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { NotificationsService } from './notifications.service';
import { NotificationsScheduler } from './notifications.scheduler';
import { BackupReportService } from './reports/backup-report.service';

@Module({
    imports: [
        TelegramModule,
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