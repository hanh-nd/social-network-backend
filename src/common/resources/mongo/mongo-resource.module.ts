import { Module } from '@nestjs/common';
import { IDataResources } from '../data.resource';
import { MongoDataResources } from './mongo-data.resource';

@Module({
    providers: [
        {
            provide: IDataResources,
            useClass: MongoDataResources,
        },
    ],
    exports: [IDataResources],
})
export class MongoResourceModule {}
