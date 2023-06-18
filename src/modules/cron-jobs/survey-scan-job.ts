import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { NotificationAction, NotificationTargetType } from 'src/common/constants';
import { createWinstonLogger } from 'src/common/modules/winston';
import { IDataServices } from 'src/common/repositories/data.service';
import { NotificationService } from '../notifications/notification.service';
import { SystemMessageService } from '../system-messages/system-message.service';
import { CronJobKey } from './cron-job.constants';

let isRunning = false;

@Injectable()
export class SurveyScanJob {
    constructor(
        private configService: ConfigService,
        private dataServices: IDataServices,
        private notificationService: NotificationService,
        private systemMessageService: SystemMessageService,
    ) {}

    private readonly logger = createWinstonLogger(SurveyScanJob.name, this.configService);

    @Cron(CronExpression.EVERY_MINUTE, {
        name: CronJobKey.SURVEY_SCAN,
    })
    async surveyScan() {
        try {
            if (isRunning) {
                return;
            }

            const config = await this.dataServices.jobConfigs.findOne({
                key: CronJobKey.SURVEY_SCAN,
            });
            if (config && !config.active) return;

            this.logger.info(`[surveyScan] start cron job`);
            isRunning = true;
            await this.scanSurveys();
            isRunning = false;
            this.logger.info(`[surveyScan] stop cron job`);
        } catch (error) {
            this.logger.error(`[surveyScan] ${error.stack || JSON.stringify(error)}`);
        }
    }

    async scanSurveys() {
        const surveys = await this.dataServices.surveys.findAll({
            askDate: {
                $gte: moment().subtract(1, 'minute').toDate(),
                $lte: moment().toDate(),
            },
        });

        for (const survey of surveys) {
            let users = [];
            let page = 1;
            const limit = 100;
            do {
                const skip = (+page - 1) * limit;
                page++;

                users = await this.dataServices.users.findAll(
                    {},
                    {
                        skip,
                        limit,
                    },
                );

                await Promise.all(
                    users.map((user) => {
                        this.notificationService.create(
                            null,
                            user,
                            NotificationTargetType.SURVEY,
                            survey,
                            NotificationAction.SEND_SURVEY,
                        );
                    }),
                );
            } while (users.length);
        }
    }
}
