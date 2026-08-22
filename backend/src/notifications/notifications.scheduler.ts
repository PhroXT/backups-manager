import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { BackupReportService } from './reports/backup-report.service';
import { NotificationsService } from './notifications.service';

@Injectable()
export class NotificationsScheduler {
    constructor(
        private readonly prisma: PrismaService,
        private readonly backupReportService: BackupReportService,
        private readonly notificationsService: NotificationsService,
    ) { }

    @Cron('* * * * *')
    async processReports() {
        const now = new Date();

        const currentTime = now
            .toTimeString()
            .slice(0, 5);

        const settings =
            await this.prisma.notificationSettings.findMany({
                where: {
                    reportEnabled: true,
                    telegramEnabled: true,
                    telegramChatId: {
                        not: null,
                    },
                    reportTime: currentTime,
                },
            });

        if (settings.length === 0) {
            return;
        }

        const reportDate = this.getPreviousDay(now);

        const report =
            await this.backupReportService.generateReport(
                reportDate,
            );

        // Si ayer no había schedules, no enviamos nada.
        if (report.expected === 0) {
            return;
        }

        const message =
            this.backupReportService.formatReport(report);

        for (const setting of settings) {
            if (!setting.telegramChatId) {
                continue;
            }

            try {
                await this.notificationsService.sendTelegramReport(
                    setting.telegramChatId,
                    message,
                );
            } catch (error) {
                console.error(
                    `Failed to send Telegram report for user ${setting.userId}`,
                    error,
                );
            }
        }
    }

    private getPreviousDay(date: Date): Date {
        const previous = new Date(date);

        previous.setDate(previous.getDate() - 1);
        previous.setHours(12, 0, 0, 0);

        return previous;
    }
}