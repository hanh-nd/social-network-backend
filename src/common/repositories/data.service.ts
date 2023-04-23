import { User } from 'src/mongo-schemas/user.schema';
import { IGenericRepository } from './generic.repository';

export abstract class IDataServices {
    abstract users: IGenericRepository<User>;
}
