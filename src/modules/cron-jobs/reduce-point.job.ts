import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { createWinstonLogger } from 'src/common/modules/winston';
import { IDataServices } from 'src/common/repositories/data.service';
import { CronJobKey } from './cron-job.constants';

const CRON_JOB_REDUCE_POINT = process.env.CRON_JOB_REDUCE_POINT || '0 3 * * *';
let isRunning = false;
@Injectable()
export class ReducePointJob {
    constructor(private configService: ConfigService, private dataServices: IDataServices) {}

    private readonly logger = createWinstonLogger(ReducePointJob.name, this.configService);

    @Cron(CRON_JOB_REDUCE_POINT, {
        name: CronJobKey.REDUCE_POINT,
        timeZone: 'Asia/Bangkok',
    })
    async reducePostPoints() {
        try {
            if (isRunning) {
                return;
            }

            const config = await this.dataServices.jobConfigs.findOne({
                key: CronJobKey.REDUCE_POINT,
            });
            if (config && !config.active) return;

            this.logger.info(`[reducePostPoints] start cron job`);
            isRunning = true;
            await this.dataServices.posts.bulkUpdate(
                {
                    point: {
                        $gt: 0,
                    },
                },
                {
                    $inc: {
                        point: -50,
                    },
                },
            );

            await this.dataServices.posts.bulkUpdate(
                {
                    point: {
                        $lt: 0,
                    },
                },
                {
                    point: 0,
                },
            );
            isRunning = false;
            this.logger.info(`[reducePostPoints] stop cron job`);
        } catch (error) {
            this.logger.error(`[reducePostPoints] ${error.stack || JSON.stringify(error)}`);
            isRunning = false;
        }
    }
}
