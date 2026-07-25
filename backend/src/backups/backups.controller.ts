import {
    Controller,
    Get,
    Post,
    Param,
} from '@nestjs/common';

import { BackupsService } from './backups.service';
import { BackupExecutorService } from './backup-executor.service';


@Controller('backups')
export class BackupsController {

    constructor(
        private readonly backupsService: BackupsService,
        private readonly executor: BackupExecutorService,
    ) { }


    @Post('project/:id')
    async create(
        @Param('id') id: string,
    ) {

        const backup =
            await this.backupsService.create(id);


        await this.executor.execute(
            backup.id
        );


        return backup;

    }


    @Get()
    findAll() {
        return this.backupsService.findAll();
    }

}