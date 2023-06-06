import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { SubscribeRequestService } from './subscribe-request.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule],
    providers: [SubscribeRequestService],
    exports: [SubscribeRequestService],
})
export class SubscribeRequestModule {}
