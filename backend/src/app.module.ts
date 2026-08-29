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
import { NotificationsModule } from './notifications/notifications.module';
import { EncryptionModule } from './common/encryption/encryption.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    /*     BullModule.forRoot({
          connection: {
            host: 'localhost',
            port: 6379,
          },
        }), */
    QueueModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, }),
    PrismaModule,
    ProjectsModule,
    BackupsModule,
    StorageModule,
    CommonModule,
    AuthModule,
    SchedulesModule,
    NotificationsModule,
    EncryptionModule,
    DashboardModule,
  ]
})
export class AppModule { }