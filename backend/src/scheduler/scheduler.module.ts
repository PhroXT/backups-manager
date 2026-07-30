import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SchedulesModule } from '../schedules/schedules.module';
import { BackupsModule } from '../backups/backups.module';

@Module({
    imports: [
        SchedulesModule,
        BackupsModule,
    ],
    providers: [
        SchedulerService,
    ],
})
export class SchedulerModule { }