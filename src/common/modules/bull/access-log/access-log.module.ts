import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { RedisModule } from '../../redis/redis.module';
import { AccessLogProcessor } from './access-log.processor';

@Module({
    imports: [
        BullModule.registerQueue({
            name: 'access-log',
        }),
        RedisModule,
        DataServicesModule,
    ],
    providers: [AccessLogProcessor],
    exports: [BullModule],
})
export class AccessLogModule {}
