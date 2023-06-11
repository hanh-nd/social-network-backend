import { Module } from '@nestjs/common';
import { DataServicesModule } from 'src/common/repositories/data-services.module';
import { FileModule } from 'src/modules/files/file.module';
import { IDataResources } from '../data.resource';
import { MongoDataResources } from './mongo-data.resource';

@Module({
    imports: [DataServicesModule, FileModule],
    providers: [
        {
            provide: IDataResources,
            useClass: MongoDataResources,
        },
    ],
    exports: [IDataResources],
})
export class MongoResourceModule {}
