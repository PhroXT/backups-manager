import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
} from '@nestjs/common';

import { NotificationsService } from './notifications.service';
import { UpdateNotificationSettingsDto } from './dto/update-notification-settings.dto';

@Controller('notifications')
export class NotificationsController {
    constructor(
        private readonly notificationsService: NotificationsService,
    ) { }

    @Get('settings/:userId')
    async getSettings(
        @Param('userId') userId: string,
    ) {
        return this.notificationsService.getSettings(userId);
    }

    @Patch('settings/:userId')
    async updateSettings(
        @Param('userId') userId: string,
        @Body() data: UpdateNotificationSettingsDto,
    ) {
        return this.notificationsService.updateSettings(
            userId,
            data,
        );
    }
}