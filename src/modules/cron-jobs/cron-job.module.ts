import { Module } from '@nestjs/common';
import { RedisModule } from 'src/common/modules/redis/redis.module';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { NotificationModule } from '../notifications/notification.module';
import { SystemMessageModule } from '../system-messages/system-message.module';
import { HappyBirthdayJob } from './happy-birthday.job';
import { OnlineAlertJob } from './online-alert.job';
import { SleepReminderJob } from './sleep-reminder.job';

@Module({
    imports: [DataServicesModule, RedisModule, NotificationModule, SystemMessageModule],
    providers: [OnlineAlertJob, HappyBirthdayJob, SleepReminderJob],
})
export class CronJobModule {}