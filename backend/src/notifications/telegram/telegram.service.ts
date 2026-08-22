import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class TelegramService {
    private readonly token = process.env.TELEGRAM_BOT_TOKEN;

    async sendMessage(
        chatId: string,
        message: string,
    ): Promise<void> {
        if (!this.token) {
            throw new InternalServerErrorException(
                'TELEGRAM_BOT_TOKEN is not configured',
            );
        }

        const response = await fetch(
            `https://api.telegram.org/bot${this.token}/sendMessage`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML',
                }),
            },
        );

        const result = await response.json();

        if (!response.ok || !result.ok) {
            throw new InternalServerErrorException(
                `Telegram error: ${result.description ?? 'Unknown error'}`,
            );
        }
    }
}