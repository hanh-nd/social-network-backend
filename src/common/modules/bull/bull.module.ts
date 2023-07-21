import { BullModule as NestJSBullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigKey } from 'src/common/config';
import { AccessLogModule } from './access-log/access-log.module';

@Module({
    imports: [
        NestJSBullModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const redisConnectionString = configService.get<string>(ConfigKey.REDIS_CONNECTION_STRING);
                console.log(`[BullModule] connecting to ${redisConnectionString}`);
                const url = new URL(redisConnectionString);

                return {
                    redis: {
                        host: url.hostname,
                        password: url.password,
                        port: Number(url.port),
                        username: url.username,
                    },
                };
            },
        }),
        AccessLogModule,
    ],
    exports: [AccessLogModule],
})
export class BullModule {}
