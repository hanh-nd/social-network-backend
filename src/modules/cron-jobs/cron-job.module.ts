import { Module } from '@nestjs/common';
import { RedisModule } from 'src/common/modules/redis/redis.module';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { SystemMessageModule } from '../moderator/system-messages/moderator-system-message.module';
import { NotificationModule } from '../notifications/notification.module';
import { HappyBirthdayJob } from './happy-birthday.job';
import { OnlineAlertJob } from './online-alert.job';
import { ReducePointJob } from './reduce-point.job';
import { RemoveLimitUserJob } from './remove-limit-user.job';
import { SleepReminderJob } from './sleep-reminder.job';
import { SurveyScanJob } from './survey-scan-job';

@Module({
    imports: [DataServicesModule, RedisModule, NotificationModule, SystemMessageModule],
    providers: [OnlineAlertJob, HappyBirthdayJob, SleepReminderJob, ReducePointJob, SurveyScanJob, RemoveLimitUserJob],
})
export class CronJobModule {}
