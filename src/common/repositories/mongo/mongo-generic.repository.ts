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
                $ne: null,
            },
        });
        return this._model.find(where).populate(this._populateOnFind).exec();
    }

    async findOne(where?: object): Promise<T | null> {
        Object.assign(where, {
            deletedAt: {
                $ne: null,
            },
        });
        const item = await this._model
            .findOne(where)
            .populate(this._populateOnFind)
            .exec();
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

    async update(id: string, item: Partial<T>): Promise<void> {
        return this._model.findByIdAndUpdate(id, item);
    }

    async delete(id: string): Promise<void> {
        return this.update(id, {
            deletedAt: Date.now(),
        } as unknown as Partial<T>);
    }
}
