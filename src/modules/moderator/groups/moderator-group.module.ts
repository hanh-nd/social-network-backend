import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ElasticsearchModule } from 'src/common/modules/elasticsearch';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { ModeratorGroupController } from './moderator-group.controller';
import { ModeratorGroupService } from './moderator-group.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, ElasticsearchModule, JwtModule],
    controllers: [ModeratorGroupController],
    providers: [ModeratorGroupService],
    exports: [ModeratorGroupService],
})
export class ModeratorGroupModule {}
