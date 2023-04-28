import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule as ELModule } from '@nestjs/elasticsearch';
import { ElasticsearchService } from './elasticsearch.service';

@Module({
    imports: [
        ConfigModule,
        ELModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                node: configService.get('ELASTICSEARCH_NODE'),
                auth: {
                    username: configService.get('ELASTICSEARCH_USERNAME'),
                    password: configService.get('ELASTICSEARCH_PASSWORD'),
                },
            }),
        }),
    ],
    providers: [ElasticsearchService],
    exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
