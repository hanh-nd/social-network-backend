import { RedisModule as BaseRedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigKey } from 'src/common/config';
import { RedisService } from './redis.service';

@Module({
    imports: [
        BaseRedisModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const redisConnectionString = configService.get<string>(ConfigKey.REDIS_CONNECTION_STRING);
                console.log(`[RedisModule] connecting to ${redisConnectionString}`);
                return {
                    config: {
                        url: redisConnectionString,
                    },
                };
            },
        }),
    ],
    providers: [RedisService],
    exports: [RedisService],
})
export class RedisModule {}
