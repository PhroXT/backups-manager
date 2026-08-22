import {
    Controller,
    Get,
    Post,
    Param,
    Query,
} from '@nestjs/common';

import { BackupsService } from './backups.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { BackupReportService } from '../notifications/reports/backup-report.service';

@Controller('backups')
export class BackupsController {

    constructor(
        private readonly backupsService: BackupsService,
        private readonly backupReportService: BackupReportService,
    ) { }

    @Post('project/:id')
    async create(
        @Param('id') id: string,
    ) {
        //return this.backupsService.create(id);
        return this.backupsService.create(id, {
            weeklyKey: 'monday',
        });
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

    @Get('report')
    async getReport(@Query('date') date?: string) {
        const reportDate = date
            ? new Date(`${date}T12:00:00`)
            : new Date();

        return this.backupReportService.generateReport(reportDate);
    }

}