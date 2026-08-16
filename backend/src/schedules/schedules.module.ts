import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SchedulesService } from './schedules.service';
import { SchedulesController } from './schedules.controller';
import { PaginationModule } from '../common/pagination/pagination.module';

@Module({

    imports: [
        PrismaModule,
        PaginationModule,
    ],
    providers: [
        SchedulesService,
    ],
    exports: [
        SchedulesService,
    ],
    controllers: [
        SchedulesController,
    ],
})
export class SchedulesModule { }