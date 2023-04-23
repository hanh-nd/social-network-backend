import { UserDocument } from 'src/mongo-schemas';
import { IGenericResource } from './generic.resource';

export abstract class IDataResources {
    abstract users: IGenericResource<UserDocument>;
}
