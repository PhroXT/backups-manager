import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString } from 'class-validator';

export class PaginationDto {

    @Type(() => Number)
    @IsInt()
    @Min(1)
    page = 1;


    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit = 10;


    @IsOptional()
    @IsString()
    search?: string;


    @IsOptional()
    @IsString()
    sort?: string;


    @IsOptional()
    @IsString()
    order?: "asc" | "desc";
}