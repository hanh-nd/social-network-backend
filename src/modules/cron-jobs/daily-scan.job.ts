import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createWinstonLogger } from 'src/common/modules/winston';
import { IDataServices } from 'src/common/repositories/data.service';
import { SystemMessageService } from '../moderator/system-messages/moderator-system-message.service';
import { NotificationService } from '../notifications/notification.service';
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
        timeZone: 'Asia/Bangkok',
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
            isRunning = false;
            this.logger.info(`[dailyScan] stop cron job`);
        } catch (error) {
            this.logger.error(`[dailyScan] ${error.stack || JSON.stringify(error)}`);
        }
    }
}
