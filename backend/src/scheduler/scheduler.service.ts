import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { SchedulesService } from '../schedules/schedules.service';
import { CronTime } from 'cron';
import { BackupsService } from '../backups/backups.service';

@Injectable()
export class SchedulerService {

    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        private readonly schedulesService: SchedulesService,
        private readonly backupsService: BackupsService,
    ) { }

    @Cron('* 5 * * *')
    async handleCron() {

        const schedules =
            await this.schedulesService.findEnabled();

        const now = new Date();

        for (const schedule of schedules) {

            try {
                const shouldRun =
                    this.shouldExecute(schedule, now);

                if (shouldRun) {

                    this.logger.log(
                        `Executing schedule ${schedule.id}`,
                    );

                    const backup = await this.backupsService.create(
                        schedule.projectId,
                    );

                    if (backup) {
                        await this.schedulesService.updateLastRun(
                            schedule.id,
                        );
                    }

                    const retention =
                        this.getRetention(schedule, now);

                    await this.backupsService.create(
                        schedule.projectId,
                        retention,
                    );

                    await this.backupsService.create(
                        schedule.projectId,
                        retention,
                    );
                }
            } catch (error) {

                this.logger.error(
                    `Schedule ${schedule.id} failed`,
                    error,
                );

            }
        }
    }

    private getRetention(
        schedule: any,
        date: Date,
    ): {
        weeklyKey?: string;
        monthlyKey?: string;
    } | undefined {

        const retention: {
            weeklyKey?: string;
            monthlyKey?: string;
        } = {};

        if (schedule.weeklyRetention) {

            const days = [
                'sunday',
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
            ];

            retention.weeklyKey =
                days[date.getDay()];
        }

        if (
            schedule.monthlyRetention &&
            date.getDate() === 1
        ) {

            retention.monthlyKey =
                String(date.getMonth() + 1);
        }

        if (
            !retention.weeklyKey &&
            !retention.monthlyKey
        ) {
            return undefined;
        }

        return retention;
    }

    private shouldExecute(
        schedule: any,
        now: Date,
    ): boolean {

        const cronTime =
            new CronTime(schedule.cron);

        const reference =
            schedule.lastRun ?? now;

        const next =
            cronTime.getNextDateFrom(
                reference,
            );

        return next.toMillis() <= now.getTime();
    }

}