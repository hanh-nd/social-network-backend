import { ObjectId } from 'mongodb';
export abstract class IGenericRepository<T> {
    abstract findAndCountAll(
        where: object,
        options?: unknown,
    ): Promise<{
        items: T[];
        totalItems: number;
    }>;

    abstract findAll(where: object, options?: unknown): Promise<T[]>;

    abstract count(where: object): Promise<number>;

    abstract findOne(where: object, options?: unknown): Promise<T>;

    abstract findById(id: string | ObjectId, options?: unknown): Promise<T>;

    abstract create(item: Partial<T>): Promise<T>;

    abstract bulkCreate(items: Partial<T>[]): Promise<T[]>;

    abstract updateById(id: string | ObjectId, item: Partial<T>, options?: unknown): Promise<T>;

    abstract updateOne(where: object, item: Partial<T>, options?: unknown): Promise<T>;

    abstract bulkUpdate(where: object, item: Partial<T>): Promise<void>;

    abstract deleteById(id: string | ObjectId): Promise<void>;

    abstract deleteOne(where: object): Promise<void>;

    abstract bulkDelete(where: object): Promise<void>;
}
