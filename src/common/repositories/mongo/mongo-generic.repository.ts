import { Model } from 'mongoose';
import { toObjectId } from 'src/common/helper';
import { IGenericRepository } from '../generic.repository';

export class MongoGenericRepository<T> implements IGenericRepository<T> {
    private _model: Model<T>;

    constructor(model: Model<T>) {
        this._model = model;
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

    async findAll(where = {}, options: any = {}): Promise<T[]> {
        Object.assign(where, {
            deletedAt: {
                $eq: null,
            },
        });
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

    async count(where = {}): Promise<number> {
        Object.assign(where, {
            deletedAt: {
                $eq: null,
            },
        });
        return this._model.count(where).exec();
    }

    async findOne(where?: object, options: any = {}): Promise<T | null> {
        Object.assign(where, {
            deletedAt: {
                $eq: null,
            },
        });
        let chain = this._model.findOne(where);

        if (options.populate) {
            chain = chain.populate(options.populate) as typeof chain;
        }

        if (options.select) {
            chain = chain.select(options.select);
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

    async updateById(id: string, item: Partial<T>, options: any = {}): Promise<T> {
        let chain = this._model.findByIdAndUpdate(toObjectId(id), item, {
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

    async updateOne(where: object, item: Partial<T>, options: any = {}): Promise<T> {
        let chain = this._model.findOneAndUpdate(where, item, {
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

    async bulkUpdate(where: object, item: Partial<T>): Promise<void> {
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
        Object.assign(where, {
            deletedAt: {
                $eq: null,
            },
        });
        await this.updateOne(where, {
            deletedAt: Date.now(),
        } as unknown as Partial<T>);
        return;
    }

    async bulkDelete(where: object): Promise<void> {
        Object.assign(where, {
            deletedAt: {
                $eq: null,
            },
        });
        await this.bulkUpdate(where, {
            deletedAt: Date.now(),
        } as unknown as Partial<T>);
        return;
    }
}
