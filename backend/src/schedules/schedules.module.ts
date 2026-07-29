import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SchedulesService } from './schedules.service';

@Module({
    imports: [
        PrismaModule,
    ],
    providers: [
        SchedulesService,
    ],
    exports: [
        SchedulesService,
    ],
})
export class SchedulesModule { }