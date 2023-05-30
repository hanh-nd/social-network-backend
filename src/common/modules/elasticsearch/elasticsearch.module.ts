import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule as ELModule } from '@nestjs/elasticsearch';
import { ElasticsearchService } from './elasticsearch.service';
import { ConfigKey } from 'src/common/config';

@Module({
    imports: [
        ConfigModule,
        ELModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const node = configService.get<string>(ConfigKey.ELASTICSEARCH_NODE);
                const username = configService.get<string>(ConfigKey.ELASTICSEARCH_USERNAME);
                const password = configService.get<string>(ConfigKey.ELASTICSEARCH_PASSWORD);
                console.log(`[ElasticsearchModule] connecting to ${node} username=${username} password=${password}`);

                return {
                    node,
                    auth: {
                        username,
                        password,
                    },
                };
            },
        }),
    ],
    providers: [ElasticsearchService],
    exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
