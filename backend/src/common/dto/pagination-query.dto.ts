import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min, IsString, IsIn } from "class-validator";

export class PaginationQueryDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit = 10;

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    sort?: string;

    @IsOptional()
    @IsIn(["asc", "desc"])
    order?: "asc" | "desc";
}