import {
    Controller,
    Get,
    Post,
    Param,
} from '@nestjs/common';

import { BackupsService } from './backups.service';
import { BackupExecutorService } from './backup-executor.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Query } from '@nestjs/common';

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

    @Get()
    findAll(
        @Query() query: PaginationDto,
    ) {
        return this.backupsService.findAll(query);
    }

    @Get(':id')
    findOne(
        @Param('id') id: string,
    ) {
        return this.backupsService.findOne(id);
    }
}