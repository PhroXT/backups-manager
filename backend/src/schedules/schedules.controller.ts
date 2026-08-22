import {
    Controller,
    Get,
    Post,
    Body,
    Query,
    Patch,
    Param,
    Delete,
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

    @Patch(':id/toggle')
    toggleEnabled(@Param('id') id: string) {
        return this.schedulesService.toggleEnabled(id);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() data: {
            projectId: string;
            cron: string;
            retentionType: string;
        },
    ) {
        return this.schedulesService.update(id, data);
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
    ) {
        return this.schedulesService.remove(id);
    }
}