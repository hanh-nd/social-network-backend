import { Injectable } from '@nestjs/common';
import { Command } from 'nestjs-command';
import { IDataServices } from 'src/common/repositories/data.service';
import { CronJobKey } from '../cron-jobs/cron-job.constants';

const data = [
    {
        key: CronJobKey.ONLINE_ALERT,
        cronTime: '*/5 * * * *',
        active: true,
    },
    {
        key: CronJobKey.HAPPY_BIRTHDAY,
        cronTime: '0 6 * * *',
        active: true,
    },
    {
        key: CronJobKey.REDUCE_POINT,
        cronTime: '0 3 * * *',
        active: true,
    },
    {
        key: CronJobKey.SLEEP_REMINDER,
        cronTime: '*/5 0-4,21-23 * * *',
        active: true,
    },
];

@Injectable()
export class JobSeedService {
    constructor(private readonly dataServices: IDataServices) {}

    @Command({ command: 'create:jobs', describe: 'create default jobs' })
    async create() {
        for (const job of data) {
            await this.dataServices.jobConfigs.updateOne(
                {
                    key: job.key,
                },
                {
                    key: job.key,
                    cronTime: job.cronTime,
                    active: job.active,
                },
                {
                    upsert: true,
                },
            );
        }
        console.log('===== Seeded successfully');
        return;
    }
}
