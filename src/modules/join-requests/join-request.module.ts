import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { JoinRequestService } from './join-request.service';
import { NotificationModule } from '../notifications/notification.module';

@Module({
    imports: [DataServicesModule, DataResourcesModule, NotificationModule],
    providers: [JoinRequestService],
    exports: [JoinRequestService],
})
export class JoinRequestModule {}
