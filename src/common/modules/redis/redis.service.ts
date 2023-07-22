import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { Redis, RedisKey } from 'ioredis';
import { isNil, isNumber, isString } from 'lodash';

@Injectable()
export class RedisService {
    constructor(@InjectRedis() private readonly redis: Redis) {}

    getClient(): Redis {
        return this.redis;
    }

    async set<T = unknown>(key: RedisKey, value: T, expiredTime = 2629800) {
        if (isNil(value)) return;

        if (isString(value) || isNumber(value)) {
            return await this.redis.set(key, value, 'EX', expiredTime);
        }
        await this.redis.set(key, JSON.stringify(value), 'EX', expiredTime);
    }

    async get<T = unknown>(key: RedisKey): Promise<T> {
        const data = await this.redis.get(key);
        try {
            return JSON.parse(data);
        } catch (error) {
            return data as T;
        }
    }

    async delete(key: RedisKey): Promise<number> {
        return await this.redis.del(key);
    }
}
