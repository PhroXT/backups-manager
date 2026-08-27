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
    sshEnabled?: boolean;

    @IsOptional()
    @IsString()
    sshHost?: string;

    @IsOptional()
    @IsInt()
    sshPort?: number;

    @IsOptional()
    @IsString()
    sshUsername?: string;

    @IsOptional()
    @IsString()
    sshPassword?: string;

    @IsOptional()
    @IsBoolean()
    enabled?: boolean;
}