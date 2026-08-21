import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { BackupsModule } from './backups/backups.module';
import { StorageModule } from './storage/storage.module';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerModule } from './scheduler/scheduler.module';
import { SchedulesModule } from './schedules/schedules.module';
import { CommonModule } from "./common/common.module";
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
    }),
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, }),
    PrismaModule, ProjectsModule,
    PrismaModule,
    ProjectsModule,
    BackupsModule,
    StorageModule,
    SchedulerModule,
    SchedulesModule,
    CommonModule,
    AuthModule,
  ]
})
export class AppModule { }