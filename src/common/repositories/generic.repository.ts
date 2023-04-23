import { ObjectId } from 'mongodb';
export abstract class IGenericRepository<T> {
    abstract findAll(where?: object): Promise<T[]>;

    abstract findOne(where?: object): Promise<T>;

    abstract findById(id: string | ObjectId): Promise<T>;

    abstract create(item: Partial<T>): Promise<T>;

    abstract bulkCreate(items: Partial<T>[]): Promise<T[]>;

    abstract update(id: string, item: Partial<T>): Promise<void>;

    abstract delete(id: string): Promise<void>;

    abstract bulkDelete(ids: string[]): Promise<void>;
}
