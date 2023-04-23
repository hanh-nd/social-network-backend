import { ObjectId } from 'mongodb';
export abstract class IGenericRepository<T> {
    abstract findAll(where?: object): Promise<T[]>;

    abstract findOne(where?: object): Promise<T>;

    abstract findById(id: string | ObjectId): Promise<T>;

    abstract create(item: Partial<T>): Promise<T>;

    abstract bulkCreate(items: Partial<T>[]): Promise<T[]>;

    abstract updateById(id: string | ObjectId, item: Partial<T>): Promise<T>;

    abstract updateOne(where: object, item: Partial<T>): Promise<T>;

    abstract bulkUpdate(where: object, item: Partial<T>): Promise<void>;

    abstract deleteById(id: string | ObjectId): Promise<void>;

    abstract deleteOne(where: object): Promise<void>;

    abstract bulkDelete(where: object): Promise<void>;
}
