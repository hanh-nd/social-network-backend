import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import moment from 'moment';
import { createWinstonLogger } from 'src/common/modules/winston';
import { IDataServices } from 'src/common/repositories/data.service';
import { SystemMessageService } from '../moderator/system-messages/moderator-system-message.service';
import { NotificationService } from '../notifications/notification.service';
import { CronJobKey } from './cron-job.constants';

const CRON_JOB_REMOVE_LIMIT_USER = process.env.CRON_JOB_REMOVE_LIMIT_USER || '*/20 * * * *';

let isRunning = false;

@Injectable()
export class RemoveLimitUserJob {
    constructor(
        private configService: ConfigService,
        private dataServices: IDataServices,
        private notificationService: NotificationService,
        private systemMessageService: SystemMessageService,
    ) {}

    private readonly logger = createWinstonLogger(RemoveLimitUserJob.name, this.configService);

    @Cron(CRON_JOB_REMOVE_LIMIT_USER, {
        name: CronJobKey.REMOVE_LIMIT_USER,
        timeZone: 'Asia/Bangkok',
    })
    async removeLimitUser() {
        try {
            if (isRunning) {
                return;
            }

            const config = await this.dataServices.jobConfigs.findOne({
                key: CronJobKey.DAILY_SCAN,
            });
            if (config && !config.active) return;

            this.logger.info(`[removeLimitUser] start cron job`);
            isRunning = true;
            await this.undoLimitUsers();
            isRunning = false;
            this.logger.info(`[removeLimitUser] stop cron job`);
        } catch (error) {
            this.logger.error(`[removeLimitUser] ${error.stack || JSON.stringify(error)}`);
        }
    }

    async undoLimitUsers() {
        await this.dataServices.users.bulkUpdate(
            {
                lastLimitedAt: {
                    $lte: moment().subtract(20, 'minutes').toDate(),
                },
            },
            {
                lastLimitedAt: null,
            },
        );
    }
}
