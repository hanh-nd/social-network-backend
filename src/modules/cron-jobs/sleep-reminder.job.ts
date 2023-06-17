import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment';
import { NotificationAction, NotificationTargetType } from 'src/common/constants';
import { RedisKey } from 'src/common/modules/redis/redis.constants';
import { RedisService } from 'src/common/modules/redis/redis.service';
import { createWinstonLogger } from 'src/common/modules/winston';
import { IDataServices } from 'src/common/repositories/data.service';
import { User } from 'src/mongo-schemas';
import { NotificationService } from '../notifications/notification.service';
import { SystemMessageService } from '../system-messages/system-message.service';
import { DefaultSystemMessageCode } from '../system-messages/sytem-message.constants';
import { CronJobKey } from './cron-job.constants';

const CRON_JOB_SLEEP_REMINDER = process.env.CRON_JOB_SLEEP_REMINDER || '*/5 0-4,21-23 * * *';
let isRunning = false;
@Injectable()
export class SleepReminderJob {
    constructor(
        private configService: ConfigService,
        private dataServices: IDataServices,
        private notificationService: NotificationService,
        private systemMessageService: SystemMessageService,
        private redisService: RedisService,
    ) {}

    private readonly logger = createWinstonLogger(SleepReminderJob.name, this.configService);

    @Cron(CRON_JOB_SLEEP_REMINDER, {
        name: CronJobKey.SLEEP_REMINDER,
    })
    async scanOnlineUsers() {
        try {
            if (isRunning) {
                return;
            }

            const config = await this.dataServices.jobConfigs.findOne({
                key: CronJobKey.SLEEP_REMINDER,
            });
            if (config && !config.active) return;

            this.logger.info(`[scanOnlineUsers] start cron job`);
            isRunning = true;
            const client = await this.redisService.getClient();
            const matchedUserIds = await client.zrangebyscore(RedisKey.ONLINE_USERS, 1, '+inf');

            if (matchedUserIds.length) {
                const sleepReminderSystemMessage = await this.systemMessageService.getMessageByCode(
                    DefaultSystemMessageCode.SLEEP_REMINDER,
                );
                for (const userId of matchedUserIds) {
                    const lastOnlineAt = await this.redisService.get(`${RedisKey.LAST_ONLINE}_${userId}`);
                    if (!lastOnlineAt) continue;

                    this.notificationService.create(
                        null,
                        { _id: userId } as unknown as Partial<User>,
                        NotificationTargetType.SYSTEM_MESSAGE,
                        sleepReminderSystemMessage,
                        NotificationAction.SEND_MESSAGE,
                        {
                            time: moment().format(`HH:mm`),
                        },
                        true,
                    );
                }
            }
            isRunning = false;
            this.logger.info(`[scanOnlineUsers] stop cron job`);
        } catch (error) {
            this.logger.error(`[scanOnlineUsers] ${error.stack || JSON.stringify(error)}`);
        }
    }
}
