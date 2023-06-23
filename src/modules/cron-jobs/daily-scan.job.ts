import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import moment from 'moment';
import { createWinstonLogger } from 'src/common/modules/winston';
import { IDataServices } from 'src/common/repositories/data.service';
import { NotificationService } from '../notifications/notification.service';
import { SystemMessageService } from '../system-messages/system-message.service';
import { CronJobKey } from './cron-job.constants';

let isRunning = false;

@Injectable()
export class DailyScanJob {
    constructor(
        private configService: ConfigService,
        private dataServices: IDataServices,
        private notificationService: NotificationService,
        private systemMessageService: SystemMessageService,
    ) {}

    private readonly logger = createWinstonLogger(DailyScanJob.name, this.configService);

    @Cron(CronExpression.EVERY_DAY_AT_1AM, {
        name: CronJobKey.DAILY_SCAN,
    })
    async dailyScan() {
        try {
            if (isRunning) {
                return;
            }

            const config = await this.dataServices.jobConfigs.findOne({
                key: CronJobKey.DAILY_SCAN,
            });
            if (config && !config.active) return;

            this.logger.info(`[dailyScan] start cron job`);
            isRunning = true;
            await this.undoLimitUsers();
            isRunning = false;
            this.logger.info(`[dailyScan] stop cron job`);
        } catch (error) {
            this.logger.error(`[dailyScan] ${error.stack || JSON.stringify(error)}`);
        }
    }

    async undoLimitUsers() {
        await this.dataServices.users.bulkUpdate(
            {
                lastLimitedAt: {
                    $gte: moment().startOf('day').subtract(1, 'day').toDate(),
                    $lte: moment().endOf('day').subtract(1, 'day').toDate(),
                },
            },
            {
                lastLimitedAt: null,
            },
        );
    }
}
