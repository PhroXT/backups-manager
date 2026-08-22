import { Injectable } from '@nestjs/common';
import { TelegramService } from './telegram/telegram.service';

@Injectable()
export class NotificationsService {
    constructor(
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
}