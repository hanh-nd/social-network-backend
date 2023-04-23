import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { UserDocument } from 'src/mongo-schemas';
import { IDataResources } from '../data.resource';
import { IGenericResource } from '../generic.resource';
import { UserResource } from './user.resource';

@Injectable()
export class MongoDataResources implements IDataResources, OnApplicationBootstrap {
    users: IGenericResource<UserDocument>;

    onApplicationBootstrap() {
        this.users = new UserResource();
    }
}
