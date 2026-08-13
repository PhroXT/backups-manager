import {
    Controller,
    Get,
    Post,
    Param,
    Query,
} from '@nestjs/common';

import { BackupsService } from './backups.service';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('backups')
export class BackupsController {

    constructor(
        private readonly backupsService: BackupsService,
    ) { }

    @Post('project/:id')
    async create(
        @Param('id') id: string,
    ) {
        return this.backupsService.create(id);
    }

    @Post(':id/cancel')
    cancel(
        @Param('id') id: string,
    ) {
        return this.backupsService.cancel(id);
    }

    @Get()
    findAll(
        @Query() query: PaginationDto,
    ) {
        return this.backupsService.findAll(query);
    }

    @Get('active')
    findActive() {
        return this.backupsService.findActive();
    }

    @Get(':id')
    findOne(
        @Param('id') id: string,
    ) {
        return this.backupsService.findOne(id);
    }

}