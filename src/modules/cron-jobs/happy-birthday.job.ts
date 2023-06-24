import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import * as moment from 'moment';
import { NotificationAction, NotificationTargetType } from 'src/common/constants';
import { createWinstonLogger } from 'src/common/modules/winston';
import { IDataServices } from 'src/common/repositories/data.service';
import { User } from 'src/mongo-schemas';
import { NotificationService } from '../notifications/notification.service';
import { SystemMessageService } from '../moderator/system-messages/moderator-system-message.service';
import { DefaultSystemMessageCode } from '../moderator/system-messages/moderator-system-message.constants';
import { CronJobKey } from './cron-job.constants';

const CRON_JOB_HAPPY_BIRTHDAY = process.env.CRON_JOB_HAPPY_BIRTHDAY || '0 6 * * *';
let isRunning = false;
@Injectable()
export class HappyBirthdayJob {
    constructor(
        private configService: ConfigService,
        private dataServices: IDataServices,
        private notificationService: NotificationService,
        private systemMessageService: SystemMessageService,
    ) {}

    private readonly logger = createWinstonLogger(HappyBirthdayJob.name, this.configService);

    @Cron(CRON_JOB_HAPPY_BIRTHDAY, {
        name: CronJobKey.HAPPY_BIRTHDAY,
    })
    async scanBirthdayUsers() {
        try {
            if (isRunning) {
                return;
            }

            const config = await this.dataServices.jobConfigs.findOne({
                key: CronJobKey.HAPPY_BIRTHDAY,
            });
            if (config && !config.active) return;

            this.logger.info(`[scanBirthdayUsers] start cron job`);
            isRunning = true;

            const birthdayUserDetails = await this.dataServices.userDetails.findAll(
                {
                    dob: moment().format(`MMDD`),
                },
                {
                    populate: 'userId',
                },
            );

            const happyBirthdaySystemMessage = await this.systemMessageService.getMessageByCode(
                DefaultSystemMessageCode.HAPPY_BIRTHDAY,
            );

            for (const userDetail of birthdayUserDetails) {
                this.notificationService.create(
                    null,
                    userDetail.userId as unknown as Partial<User>,
                    NotificationTargetType.SYSTEM_MESSAGE,
                    happyBirthdaySystemMessage,
                    NotificationAction.SEND_MESSAGE,
                    {},
                    true,
                );
            }
            isRunning = false;
            this.logger.info(`[scanBirthdayUsers] stop cron job`);
        } catch (error) {
            this.logger.error(`[scanBirthdayUsers] ${error.stack || JSON.stringify(error)}`);
        }
    }
}
