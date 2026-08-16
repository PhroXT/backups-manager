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

    @Cron('* * * * *')
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

                    const retention = this.getRetention(
                        schedule,
                        now,
                    );

                    const backup = await this.backupsService.create(
                        schedule.projectId,
                        retention,
                    );

                    if (backup) {
                        await this.schedulesService.updateLastRun(
                            schedule.id,
                        );
                    }

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
    ) {
        if (schedule.retentionType === 'monthly') {
            return {
                monthlyKey: String(
                    date.getMonth() + 1,
                ).padStart(2, '0'),
            };
        }

        const days = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday',
        ];

        return {
            weeklyKey: days[date.getDay()],
        };
    }

    private shouldExecute(
        schedule: any,
        now: Date,
    ): boolean {

        const cronTime =
            new CronTime(schedule.cron);

        if (!schedule.lastRun) {

            const reference = new Date(
                now.getTime() - 60 * 1000,
            );

            const next =
                cronTime.getNextDateFrom(reference);

            return next.toMillis() <= now.getTime();
        }

        const next =
            cronTime.getNextDateFrom(
                schedule.lastRun,
            );

        return next.toMillis() <= now.getTime();
    }

}