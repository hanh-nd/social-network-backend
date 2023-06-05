import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { ModeratorPostController } from './moderator-post.controller';
import { ModeratorPostService } from './moderator-post.service';
import { ElasticsearchModule } from 'src/common/modules/elasticsearch';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [DataServicesModule, DataResourcesModule, ElasticsearchModule, JwtModule],
    controllers: [ModeratorPostController],
    providers: [ModeratorPostService],
    exports: [ModeratorPostService],
})
export class ModeratorPostModule {}
