import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { NotificationAction, NotificationTargetType } from 'src/common/constants';
import { createWinstonLogger } from 'src/common/modules/winston';
import { IDataServices } from 'src/common/repositories/data.service';
import { User } from 'src/mongo-schemas';
import { NotificationService } from '../notifications/notification.service';
import { SystemMessageService } from '../system-messages/system-message.service';
import { DefaultSystemMessageCode } from '../system-messages/sytem-message.constants';

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

    @Cron(CronExpression.EVERY_DAY_AT_6AM)
    async scanBirthdayUsers() {
        try {
            if (isRunning) {
                return;
            }
            this.logger.info(`[HappyBirthdayJob][scanBirthdayUsers] start cron job`);
            isRunning = true;

            const birthdayUserDetails = await this.dataServices.userDetails.findAll(
                {
                    birthday: moment().toDate(),
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
                    NotificationTargetType.MESSAGE,
                    happyBirthdaySystemMessage,
                    NotificationAction.SEND_MESSAGE,
                );
            }
            isRunning = false;
            this.logger.info(`[HappyBirthdayJob][scanBirthdayUsers] stop cron job`);
        } catch (error) {
            this.logger.error(`[HappyBirthdayJob][scanBirthdayUsers] ${error.stack || JSON.stringify(error)}`);
        }
    }
}
