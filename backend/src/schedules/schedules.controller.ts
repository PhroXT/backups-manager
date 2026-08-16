import {
    Controller,
    Get,
    Post,
    Body,
} from '@nestjs/common';

import { SchedulesService } from './schedules.service';

@Controller('schedules')
export class SchedulesController {

    constructor(
        private readonly schedulesService: SchedulesService,
    ) { }

    @Get()
    findAll() {
        return this.schedulesService.findAll();
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