import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { ConfigKey } from 'src/common/config';
import { NotificationAction, NotificationTargetType } from 'src/common/constants';
import { RedisKey } from 'src/common/modules/redis/redis.constants';
import { RedisService } from 'src/common/modules/redis/redis.service';
import { createWinstonLogger } from 'src/common/modules/winston';
import { IDataServices } from 'src/common/repositories/data.service';
import { NotificationService } from '../notifications/notification.service';
import { SystemMessageService } from '../system-messages/system-message.service';
import { DefaultSystemMessageCode } from '../system-messages/sytem-message.constants';

const CRON_JOB_ONLINE_ALERT = process.env.CRON_JOB_ONLINE_ALERT || '*/5 * * * *';
let isRunning = false;
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

    @Cron(CRON_JOB_ONLINE_ALERT)
    async scanOnlineUsersAlert() {
        try {
            if (isRunning) {
                return;
            }
            this.logger.info(`[OnlineAlertJob][scanOnlineUsersAlert] start cron job`);
            isRunning = true;
            await this.scanAlertByLevel(1);
            await this.scanAlertByLevel(2);
            await this.scanAlertByLevel(3);
            isRunning = false;
            this.logger.info(`[OnlineAlertJob][scanOnlineUsersAlert] stop cron job`);
        } catch (error) {
            this.logger.error(`[OnlineAlertJob][scanOnlineUsersAlert] ${error.stack || JSON.stringify(error)}`);
        }
    }

    async scanAlertByLevel(level = 1) {
        const alertMinutes = Math.round(this.configService.get<number>(ConfigKey.ALERT_TIME_RANGE) / 60);
        const client = await this.redisService.getClient();
        const timeSpentRange = [level * alertMinutes, (level + 1) * alertMinutes];
        const matchedUsers = await client.zrangebyscore(
            RedisKey.ONLINE_USERS,
            timeSpentRange[0],
            `(${timeSpentRange[1]}`,
        );

        const alertSystemMessage = await this.systemMessageService.getMessageByCode(
            DefaultSystemMessageCode.TIME_LIMIT_WARNING,
        );
        for (const userId of matchedUsers) {
            this.notificationService.create(
                null,
                {
                    _id: userId,
                },
                NotificationTargetType.SYSTEM_MESSAGE,
                alertSystemMessage,
                NotificationAction.SEND_MESSAGE,
                {
                    minutes: alertMinutes,
                },
                true,
            );
        }
    }
}
