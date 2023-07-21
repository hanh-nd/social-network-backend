import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as moment from 'moment';
import { toObjectId } from 'src/common/helper';
import { IDataServices } from 'src/common/repositories/data.service';
import { RedisKey } from '../../redis/redis.constants';
import { RedisService } from '../../redis/redis.service';

@Processor('access-log')
export class AccessLogProcessor {
    constructor(private readonly redisService: RedisService, private readonly dataServices: IDataServices) {}

    @Process('check-time-spent')
    async handleCheckTimeSpent(job: Job) {
        const { userId } = job.data;
        await this.checkUserTimeSpent(userId);
    }

    @Process({
        name: 'calc-time-spent',
        concurrency: 0,
    })
    async handleCalcTimeSpent(job: Job) {
        try {
            const { userId } = job.data;
            await this.calcUserTimeSpend(userId);
        } catch (error) {
            console.log(`[handleCalcTimeSpent] ${error.stack || JSON.stringify(error)}`);
        }
    }

    private async checkUserTimeSpent(userId: string) {
        const client = this.redisService.getClient();
        const userAlertRange = await this.getUserAlertRange(userId);
        const sessionSpentTimeSecond =
            +(await client.zscore(`${RedisKey.ONLINE_USERS}_${userAlertRange}`, userId)) || 0;
        const cachedUserLastOnline = await client.get(`${RedisKey.LAST_ONLINE}_${userId}`);
        if (!cachedUserLastOnline) {
            // Reset counter to 0
            await client.zadd(`${RedisKey.ONLINE_USERS}_${userAlertRange}`, 0, userId);

            if (!sessionSpentTimeSecond) return;
            this.dataServices.userDailyStatistics.updateOne(
                {
                    userId: toObjectId(userId),
                    createdDate: +moment().format(`YYYYMMDD`),
                },
                {
                    $inc: {
                        spentTimeSecond: sessionSpentTimeSecond,
                    },
                    $setOnInsert: {
                        userId: toObjectId(userId),
                    },
                },
                {
                    upsert: true,
                },
            );
        } else {
            const currentTimeMoment = moment();
            const timeDiff = currentTimeMoment.diff(moment(cachedUserLastOnline, `YYYY-MM-DD HH:mm:ss`), 'second');
            if (timeDiff >= 60) {
                // User has been inactivated for over 5 minutes
                // Reset counter to 0
                await client.zadd(`${RedisKey.ONLINE_USERS}_${userAlertRange}`, 0, userId);

                if (!sessionSpentTimeSecond) return;
                this.dataServices.userDailyStatistics.updateOne(
                    {
                        userId: toObjectId(userId),
                    },
                    {
                        $inc: {
                            spentTimeSecond: sessionSpentTimeSecond,
                        },
                        $setOnInsert: {
                            userId: toObjectId(userId),
                        },
                    },
                    {
                        upsert: true,
                    },
                );
            }
        }
    }

    private async calcUserTimeSpend(userId: string) {
        const client = this.redisService.getClient();
        const currentTimeMoment = moment();
        const userAlertRange = await this.getUserAlertRange(userId);
        const cachedUserLastOnline = await client.get(`${RedisKey.LAST_ONLINE}_${userId}`);
        const sessionSpentTimeSecond =
            +(await client.zscore(`${RedisKey.ONLINE_USERS}_${userAlertRange}`, userId)) || 0;

        await client.set(
            `${RedisKey.LAST_ONLINE}_${userId}`,
            currentTimeMoment.format(`YYYY-MM-DD HH:mm:ss`),
            'EX',
            60,
        );

        if (!cachedUserLastOnline) {
            // Reset counter to 0
            await client.zadd(`${RedisKey.ONLINE_USERS}_${userAlertRange}`, 0, userId);

            if (!sessionSpentTimeSecond) return;
            this.dataServices.userDailyStatistics.updateOne(
                {
                    userId: toObjectId(userId),
                    createdDate: +moment().format(`YYYYMMDD`),
                },
                {
                    $inc: {
                        spentTimeSecond: sessionSpentTimeSecond,
                    },
                    $setOnInsert: {
                        userId: toObjectId(userId),
                    },
                },
                {
                    upsert: true,
                },
            );
        } else {
            const timeDiff = currentTimeMoment.diff(moment(cachedUserLastOnline, `YYYY-MM-DD HH:mm:ss`), 'second');
            if (timeDiff >= 60) {
                // User has been inactivated for over 5 minutes
                // Reset counter to 0
                await client.zadd(`${RedisKey.ONLINE_USERS}_${userAlertRange}`, 0, userId);

                if (!sessionSpentTimeSecond) return;
                this.dataServices.userDailyStatistics.updateOne(
                    {
                        userId: toObjectId(userId),
                    },
                    {
                        $inc: {
                            spentTimeSecond: sessionSpentTimeSecond,
                        },
                        $setOnInsert: {
                            userId: toObjectId(userId),
                        },
                    },
                    {
                        upsert: true,
                    },
                );
            } else {
                await client.zincrby(`${RedisKey.ONLINE_USERS}_${userAlertRange}`, timeDiff, userId);
            }
        }
    }

    private async getUserAlertRange(userId: string) {
        const client = this.redisService.getClient();
        const cachedUserAlertRange = +(await client.get(`${RedisKey.USER_ALERT_RANGE}_${userId}`));

        if (cachedUserAlertRange) {
            return cachedUserAlertRange;
        }

        const user = await this.dataServices.users.findById(userId);
        const userAlertRange = user?.alertRange ?? 5;
        await client.set(`${RedisKey.USER_ALERT_RANGE}_${userId}`, userAlertRange);
        return userAlertRange;
    }
}
