import { IsString, IsInt, IsBoolean, IsOptional } from 'class-validator';

export class CreateProjectDto {
    @IsString()
    name: string;

    @IsString()
    type: string;

    @IsString()
    host: string;

    @IsInt()
    port: number;

    @IsString()
    database: string;

    @IsString()
    username: string;

    @IsString()
    password: string;

    @IsOptional()
    @IsString()
    sslMode?: string;

    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}