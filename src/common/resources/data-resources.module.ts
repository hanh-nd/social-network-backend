import { Module } from '@nestjs/common';
import { MongoResourceModule } from './mongo/mongo-resource.module';

@Module({
    imports: [MongoResourceModule],
    exports: [MongoResourceModule],
})
export class DataResourcesModule {}
