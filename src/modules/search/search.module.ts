import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ElasticsearchModule } from 'src/common/modules/elasticsearch';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, ElasticsearchModule, JwtModule],
    controllers: [SearchController],
    providers: [SearchService],
})
export class SearchModule {}
