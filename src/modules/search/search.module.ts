import { Module } from '@nestjs/common';
import { ElasticsearchModule } from 'src/common/modules/elasticsearch';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { DataResourcesModule } from 'src/common/resources/data-resources.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
    imports: [DataServicesModule, DataResourcesModule, ElasticsearchModule],
    controllers: [SearchController],
    providers: [SearchService],
})
export class SearchModule {}
