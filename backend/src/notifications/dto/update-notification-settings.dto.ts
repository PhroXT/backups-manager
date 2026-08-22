import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateNotificationSettingsDto {
    @IsBoolean()
    telegramEnabled: boolean;

    @IsOptional()
    @IsString()
    telegramChatId?: string;

    @IsBoolean()
    reportEnabled: boolean;

    @IsOptional()
    @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    reportTime?: string;
}