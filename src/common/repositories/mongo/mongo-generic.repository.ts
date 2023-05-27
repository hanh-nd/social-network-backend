import { Model, UpdateQuery } from 'mongoose';
import { toObjectId } from 'src/common/helper';
import { IGenericRepository } from '../generic.repository';

export class MongoGenericRepository<T> implements IGenericRepository<T> {
    _model: Model<T>;

    constructor(model: Model<T>) {
        this._model = model;
    }

    getModel() {
        return this._model;
    }

    async findAndCountAll(
        where = {},
        options: any = {},
    ): Promise<{
        items: T[];
        totalItems: number;
    }> {
        const [items, totalItems] = await Promise.all([this.findAll(where, options), this.count(where)]);
        return {
            items,
            totalItems,
        };
    }

    async findAll(where: any = {}, options: any = {}): Promise<T[]> {
        where = Object.assign(
            {},
            {
                deletedAt: {
                    $eq: null,
                },
            },
            where,
        );
        if (options.ignoreSoftDelete) {
            delete where.deletedAt;
        }
        let chain = this._model.find(where);

        if (options.populate) {
            chain = chain.populate(options.populate) as typeof chain;
        }

        if (options.select) {
            chain = chain.select(options.select);
        }

        if (options.sort) {
            chain = chain.sort(options.sort);
        }

        if (options.skip) {
            chain = chain.skip(options.skip);
        }

        if (options.limit) {
            chain = chain.limit(options.limit);
        }

        return chain.exec();
    }

    async count(where: any = {}, options: any = {}): Promise<number> {
        where = Object.assign(
            {},
            {
                deletedAt: {
                    $eq: null,
                },
            },
            where,
        );
        if (options.ignoreSoftDelete) {
            delete where.deletedAt;
        }
        let chain = this._model.count(where);

        return chain.exec();
    }

    async findOne(where?: any, options: any = {}): Promise<T | null> {
        where = Object.assign(
            {},
            {
                deletedAt: {
                    $eq: null,
                },
            },
            where,
        );
        if (options.ignoreSoftDelete) {
            delete where.deletedAt;
        }
        let chain = this._model.findOne(where);

        if (options.populate) {
            chain = chain.populate(options.populate) as typeof chain;
        }

        if (options.select) {
            chain = chain.select(options.select);
        }

        if (options.sort) {
            chain = chain.sort(options.sort);
        }

        const item = await chain.exec();
        if (item) {
            return item as T;
        }

        return null;
    }

    async findById(id: string, options = {}): Promise<T | null> {
        return this.findOne(
            {
                _id: toObjectId(id),
            },
            options,
        );
    }

    async create(item: T): Promise<T> {
        return this._model.create(item);
    }

    async bulkCreate(items: Partial<T>[]): Promise<T[]> {
        return this._model.insertMany(items);
    }

    async updateById(id: string, item: UpdateQuery<T>, options: any = {}): Promise<T> {
        let chain = this._model.findByIdAndUpdate(toObjectId(id), item, {
            ...(options.upsert && { upsert: options.upsert }),
            new: true,
        });

        if (options.populate) {
            chain = chain.populate(options.populate) as typeof chain;
        }

        if (options.select) {
            chain = chain.select(options.select);
        }

        return chain.exec();
    }

    async updateOne(where: object, item: UpdateQuery<T>, options: any = {}): Promise<T> {
        let chain = this._model.findOneAndUpdate(where, item, {
            ...(options.upsert && { upsert: options.upsert }),
            new: true,
        });

        if (options.populate) {
            chain = chain.populate(options.populate) as typeof chain;
        }

        if (options.select) {
            chain = chain.select(options.select);
        }

        return chain.exec();
    }

    async bulkUpdate(where: object, item: UpdateQuery<T>): Promise<void> {
        await this._model.updateMany(where, item, {
            new: true,
        });
        return;
    }

    async deleteById(id: string): Promise<void> {
        await this.updateById(id, {
            deletedAt: Date.now(),
        } as unknown as Partial<T>);
        return;
    }

    async deleteOne(where: object): Promise<void> {
        where = Object.assign(
            {},
            {
                deletedAt: {
                    $eq: null,
                },
            },
            where,
        );
        await this.updateOne(where, {
            deletedAt: Date.now(),
        } as unknown as Partial<T>);
        return;
    }

    async bulkDelete(where: object): Promise<void> {
        where = Object.assign(
            {},
            {
                deletedAt: {
                    $eq: null,
                },
            },
            where,
        );
        await this.bulkUpdate(where, {
            deletedAt: Date.now(),
        } as unknown as Partial<T>);
        return;
    }
}
