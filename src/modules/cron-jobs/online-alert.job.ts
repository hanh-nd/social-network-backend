import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment';
import { NotificationAction, NotificationTargetType } from 'src/common/constants';
import { RedisKey } from 'src/common/modules/redis/redis.constants';
import { RedisService } from 'src/common/modules/redis/redis.service';
import { createWinstonLogger } from 'src/common/modules/winston';
import { IDataServices } from 'src/common/repositories/data.service';
import { DefaultSystemMessageCode } from '../moderator/system-messages/moderator-system-message.constants';
import { SystemMessageService } from '../moderator/system-messages/moderator-system-message.service';
import { NotificationService } from '../notifications/notification.service';
import { CronJobKey } from './cron-job.constants';

const CRON_JOB_ONLINE_ALERT = process.env.CRON_JOB_ONLINE_ALERT || '*/1 * * * *';
let isRunning = false;
const AVAILABLE_RANGES = [1, 5, 10, 15, 20, 25, 30];

@Injectable()
export class OnlineAlertJob {
    constructor(
        private configService: ConfigService,
        private dataServices: IDataServices,
        private redisService: RedisService,
        private notificationService: NotificationService,
        private systemMessageService: SystemMessageService,
    ) {}

    private readonly logger = createWinstonLogger(OnlineAlertJob.name, this.configService);

    @Cron(CRON_JOB_ONLINE_ALERT, {
        name: CronJobKey.ONLINE_ALERT,
        timeZone: 'Asia/Bangkok',
    })
    async scanOnlineUsersAlert() {
        try {
            if (isRunning) {
                return;
            }

            const config = await this.dataServices.jobConfigs.findOne({
                key: CronJobKey.ONLINE_ALERT,
            });
            if (config && !config.active) return;

            console.info(`[scanOnlineUsersAlert] start cron job`);
            isRunning = true;
            await this.scanAlertByLevel(1);
            await this.scanAlertByLevel(2);
            await this.scanAlertByLevel(3);
            isRunning = false;
            console.info(`[scanOnlineUsersAlert] stop cron job`);
        } catch (error) {
            this.logger.error(`[scanOnlineUsersAlert] ${error.stack || JSON.stringify(error)}`);
            isRunning = false;
        }
    }

    async scanAlertByLevel(level = 1) {
        const client = await this.redisService.getClient();
        for (const range of AVAILABLE_RANGES) {
            const timeSpentRange = [level * range * 60, (level * range + 1) * 60];
            const matchedUsers = await client.zrangebyscore(
                `${RedisKey.ONLINE_USERS}_${range}`,
                timeSpentRange[0],
                level == 3 ? '+inf' : `(${timeSpentRange[1]}`,
            );

            const alertSystemMessage = await this.systemMessageService.getMessageByCode(
                DefaultSystemMessageCode.TIME_LIMIT_WARNING,
            );
            for (const userId of matchedUsers) {
                const cachedUserLastOnline = await client.get(`${RedisKey.LAST_ONLINE}_${userId}`);
                if (!cachedUserLastOnline) continue;
                const currentTimeMoment = moment();
                const timeDiff = currentTimeMoment.diff(moment(cachedUserLastOnline, `YYYY-MM-DD HH:mm:ss`), 'second');
                if (timeDiff >= 60) continue;

                const userSpentTimeSeconds = +(await client.zscore(`${RedisKey.ONLINE_USERS}_${range}`, userId)) || 0;
                this.notificationService.create(
                    null,
                    { _id: userId },
                    NotificationTargetType.SYSTEM_MESSAGE,
                    alertSystemMessage,
                    NotificationAction.SEND_MESSAGE,
                    {
                        minutes: Math.round(userSpentTimeSeconds / 60),
                    },
                    true,
                );

                if (level === 3) {
                    this.dataServices.users.updateById(userId, {
                        lastLimitedAt: new Date(),
                    });
                }
            }
        }
    }
}
