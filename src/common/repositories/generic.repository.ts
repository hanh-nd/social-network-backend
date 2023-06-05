import { ObjectId } from 'mongodb';
import { UpdateQuery } from 'mongoose';
export abstract class IGenericRepository<T> {
    abstract findAndCountAll(
        where: object,
        options?: unknown,
    ): Promise<{
        items: T[];
        totalItems: number;
    }>;

    abstract findAll(where: object, options?: unknown): Promise<T[]>;

    abstract count(where: object, options?: unknown): Promise<number>;

    abstract findOne(where: object, options?: unknown): Promise<T>;

    abstract findById(id: string | ObjectId, options?: unknown): Promise<T>;

    abstract create(item: Partial<T>): Promise<T>;

    abstract bulkCreate(items: Partial<T>[]): Promise<T[]>;

    abstract updateById(id: string | ObjectId, item: UpdateQuery<T>, options?: unknown): Promise<T>;

    abstract updateOne(where: object, item: UpdateQuery<T>, options?: unknown): Promise<T>;

    abstract bulkUpdate(where: object, item: UpdateQuery<T>): Promise<void>;

    abstract deleteById(id: string | ObjectId, extra?: Partial<T>): Promise<void>;

    abstract deleteOne(where: object, extra?: Partial<T>): Promise<void>;

    abstract bulkDelete(where: object): Promise<void>;
}
