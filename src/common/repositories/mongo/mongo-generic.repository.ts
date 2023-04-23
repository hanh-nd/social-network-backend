import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { IGenericRepository } from '../generic.repository';

export class MongoGenericRepository<T> implements IGenericRepository<T> {
    private _model: Model<T>;
    private _populateOnFind: string[];

    constructor(model: Model<T>, populateOnFind: string[] = []) {
        this._model = model;
        this._populateOnFind = populateOnFind;
    }

    async findAll(where = {}): Promise<T[]> {
        Object.assign(where, {
            deletedAt: {
                $eq: null,
            },
        });
        return this._model.find(where).populate(this._populateOnFind).exec();
    }

    async findOne(where?: object): Promise<T | null> {
        Object.assign(where, {
            deletedAt: {
                $eq: null,
            },
        });
        const item = await this._model.findOne(where).populate(this._populateOnFind).exec();
        if (item) {
            return item as T;
        }

        return null;
    }

    async findById(id: string): Promise<T | null> {
        return this.findOne({
            _id: new ObjectId(id),
        });
    }

    async create(item: T): Promise<T> {
        return this._model.create(item);
    }

    async bulkCreate(items: Partial<T>[]): Promise<T[]> {
        return this._model.insertMany(items);
    }

    async updateById(id: string, item: Partial<T>): Promise<T> {
        return this._model.findByIdAndUpdate(new ObjectId(id), item, {
            new: true,
        });
    }

    async updateOne(where: object, item: Partial<T>): Promise<T> {
        return this._model.findOneAndUpdate(where, item, {
            new: true,
        });
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
