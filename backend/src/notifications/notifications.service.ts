import { Injectable } from '@nestjs/common';
import { TelegramService } from './telegram/telegram.service';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly telegramService: TelegramService,
    ) { }

    async sendTelegramReport(
        chatId: string,
        message: string,
    ): Promise<void> {
        await this.telegramService.sendMessage(
            chatId,
            message,
        );
    }

    async updateSettings(
        userId: string,
        data: UpdateNotificationSettingsDto,
    ) {
        return this.prisma.notificationSettings.upsert({
            where: {
                userId,
            },
            create: {
                userId,
                telegramEnabled: data.telegramEnabled,
                telegramChatId: data.telegramChatId ?? null,
                reportEnabled: data.reportEnabled,
                reportTime: data.reportTime ?? null,
            },
            update: {
                telegramEnabled: data.telegramEnabled,
                telegramChatId: data.telegramChatId ?? null,
                reportEnabled: data.reportEnabled,
                reportTime: data.reportTime ?? null,
            },
        });
    }

    async getSettings(userId: string) {
        return this.prisma.notificationSettings.findUnique({
            where: {
                userId,
            },
        });
    }
}