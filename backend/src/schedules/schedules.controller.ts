import {
    Controller,
    Get,
    Post,
    Body,
    Query,
} from '@nestjs/common';

import { SchedulesService } from './schedules.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('schedules')
export class SchedulesController {

    constructor(
        private readonly schedulesService: SchedulesService,
    ) { }

    @Get()
    findAll(
        @Query() query: PaginationDto,
    ) {
        return this.schedulesService.findAll(query);
    }

    @Post()
    create(
        @Body()
        data: {
            projectId: string;
            cron: string;
            retentionType: string;
        },
    ) {
        return this.schedulesService.create(data);
    }
}