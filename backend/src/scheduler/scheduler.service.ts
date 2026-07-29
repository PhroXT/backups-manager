import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class SchedulerService {

    private readonly logger = new Logger(SchedulerService.name);

    @Cron('* * * * *')
    handleCron() {

        this.logger.log('Scheduler is running...');

    }

}