import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { ConfigKey } from '../config';
import { toObjectId } from '../helper';
import { RedisKey } from '../modules/redis/redis.constants';
import { RedisService } from '../modules/redis/redis.service';
import { IDataServices } from '../repositories/data.service';

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
    constructor(
        private readonly redisService: RedisService,
        private readonly configService: ConfigService,
        private readonly dataServices: IDataServices,
    ) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const userId = request?.user?.userId || request?.userId;
        if (!userId) {
            return next.handle();
        }

        if (request.url === `/api/ping`) {
            await this.checkUserTimeSpent(userId);
        } else {
            await this.calcUserTimeSpend(userId);
        }

        return next.handle();
    }

    private async checkUserTimeSpent(userId: string) {
        const client = this.redisService.getClient();
        const sessionSpentTimeSecond = +(await client.zscore(RedisKey.ONLINE_USERS, userId)) || 0;

        const cachedUserLastOnline = await client.get(`${RedisKey.LAST_ONLINE}_${userId}`);
        if (!cachedUserLastOnline) {
            // Reset counter to 0
            await client.zadd(RedisKey.ONLINE_USERS, 0, userId);

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
            const ALERT_TIME_RANGE = this.configService.get<number>(ConfigKey.ALERT_TIME_RANGE);

            const timeDiff = currentTimeMoment.diff(moment(cachedUserLastOnline, `YYYY-MM-DD HH:mm:ss`), 'second');
            if (timeDiff >= ALERT_TIME_RANGE) {
                // User has been inactivated for over 5 minutes
                // Reset counter to 0
                await client.zadd(RedisKey.ONLINE_USERS, 0, userId);

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
        const ALERT_TIME_RANGE = this.configService.get<number>(ConfigKey.ALERT_TIME_RANGE);

        const cachedUserLastOnline = await client.get(`${RedisKey.LAST_ONLINE}_${userId}`);
        const sessionSpentTimeSecond = +(await client.zscore(RedisKey.ONLINE_USERS, userId)) || 0;

        if (!cachedUserLastOnline) {
            // Reset counter to 0
            await client.zadd(RedisKey.ONLINE_USERS, 0, userId);

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
            if (timeDiff >= ALERT_TIME_RANGE) {
                // User has been inactivated for over 5 minutes
                // Reset counter to 0
                await client.zadd(RedisKey.ONLINE_USERS, 0, userId);

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
                await client.zincrby(RedisKey.ONLINE_USERS, timeDiff, userId);
            }
        }

        await client.set(
            `${RedisKey.LAST_ONLINE}_${userId}`,
            currentTimeMoment.format(`YYYY-MM-DD HH:mm:ss`),
            'EX',
            ALERT_TIME_RANGE,
        );
    }
}
