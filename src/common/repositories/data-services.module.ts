import { Module } from '@nestjs/common';
import { MongoDataServicesModule } from './mongo/mongo-data-service.module';

@Module({
    imports: [MongoDataServicesModule],
    exports: [MongoDataServicesModule],
})
export class DataServicesModule {}
