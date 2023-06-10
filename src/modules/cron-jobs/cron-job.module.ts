import { Module } from '@nestjs/common';
import { RedisModule } from 'src/common/modules/redis/redis.module';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { NotificationModule } from '../notifications/notification.module';
import { SystemMessageModule } from '../system-messages/system-message.module';
import { OnlineAlertJob } from './online-alert.job';

@Module({
    imports: [DataServicesModule, RedisModule, NotificationModule, SystemMessageModule],
    providers: [OnlineAlertJob],
})
export class CronJobModule {}
