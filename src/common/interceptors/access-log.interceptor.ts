import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { ConfigKey } from '../config';
import { RedisKey } from '../modules/redis/redis.constants';
import { RedisService } from '../modules/redis/redis.service';

@Injectable()
export class AccessLogInterceptor implements NestInterceptor {
    constructor(private readonly redisService: RedisService, private readonly configService: ConfigService) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const userId = request?.user?.userId || request?.userId;
        if (!userId) {
            return next.handle();
        }

        const client = this.redisService.getClient();
        const currentTimeMoment = moment();
        const ALERT_TIME_RANGE = this.configService.get<number>(ConfigKey.ALERT_TIME_RANGE);

        const cachedUserLastOnline = await client.get(`${RedisKey.LAST_ONLINE}_${userId}`);
        if (!cachedUserLastOnline) {
            // Reset counter to 0
            await client.zadd(RedisKey.ONLINE_USERS, 0, userId);
        } else {
            const timeDiff = currentTimeMoment.diff(moment(cachedUserLastOnline, `YYYY-MM-DD HH:mm:ss`), 'second');
            if (timeDiff >= ALERT_TIME_RANGE) {
                // User has been inactivated for over 5 minutes
                // Reset counter to 0
                await client.zadd(RedisKey.ONLINE_USERS, 0, userId);
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
        return next.handle();
    }
}
