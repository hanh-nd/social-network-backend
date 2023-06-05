import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { ModeratorPostModule } from '../posts/moderator-post.module';
import { ModeratorUserModule } from '../users/moderator-user.module';
import { ModeratorReportController } from './moderator-report.controller';
import { ModeratorReportService } from './moderator-report.service';
import { ElasticsearchModule } from 'src/common/modules/elasticsearch';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        DataServicesModule,
        DataResourcesModule,
        ModeratorPostModule,
        ModeratorUserModule,
        ElasticsearchModule,
        JwtModule,
    ],
    controllers: [ModeratorReportController],
    providers: [ModeratorReportService],
})
export class ModeratorReportModule {}
