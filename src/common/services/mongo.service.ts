import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigKey } from '../config';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                return {
                    uri: configService.get<string>(
                        ConfigKey.MONGO_DATABASE_CONNECTION_STRING,
                    ),
                    dbName: configService.get<string>(
                        ConfigKey.MONGO_DATABASE_NAME,
                    ),
                };
            },
        }),
    ],
    providers: [],
})
export class MongoModule {}
