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
                }
            } catch (error) {

                this.logger.error(
                    `Schedule ${schedule.id} failed`,
                    error,
                );

            }
        }
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