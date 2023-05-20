import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { ReportModule } from '../reports/report.module';
import { MessageService } from './message.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, ReportModule],
    providers: [MessageService],
    exports: [MessageService],
})
export class MessageModule {}
