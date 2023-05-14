import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { JoinRequestService } from './join-request.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule],
    providers: [JoinRequestService],
    exports: [JoinRequestService],
})
export class JoinRequestModule {}
