import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigKey } from '../../config';
import { MongoService } from './mongo.service';

@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                const uri = configService.get<string>(ConfigKey.MONGO_DATABASE_CONNECTION_STRING);
                const dbName = configService.get<string>(ConfigKey.MONGO_DATABASE_NAME);
                console.log(`[MongoModule] connecting to ${uri}/${dbName}`);
                return {
                    uri: uri,
                    dbName: dbName,
                };
            },
        }),
    ],
    providers: [MongoService],
    exports: [MongoService],
})
export class MongoModule {}
