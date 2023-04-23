export abstract class IGenericRepository<T> {
    abstract findAll(where?: object): Promise<T[]>;

    abstract findOne(where?: object): Promise<T>;

    abstract findById(id: string): Promise<T>;

    abstract create(item: T): Promise<T>;

    abstract update(id: string, item: T): Promise<void>;

    abstract delete(id: string, item: T): Promise<void>;
}
