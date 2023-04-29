import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { ReportService } from './report.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule],
    providers: [ReportService],
    exports: [ReportService],
})
export class ReportModule {}
