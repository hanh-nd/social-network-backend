import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import * as _ from 'lodash';
import { IGridFSObject, MongoGridFS } from 'mongo-gridfs';
import { ObjectId } from 'mongodb';
import { Db, GridFSBucketReadStream } from 'mongodb';
import { Connection } from 'mongoose';
import { toObjectIds } from 'src/common/helper';

@Injectable()
export class FileService {
    private fileModel: MongoGridFS;

    constructor(@InjectConnection() private readonly connection: Connection) {
        this.fileModel = new MongoGridFS(this.connection.db as unknown as Db, 'fs');
    }

    async readStream(id: string): Promise<GridFSBucketReadStream> {
        return await this.fileModel.readFileStream(id);
    }

    async findById(id: string): Promise<IGridFSObject> {
        const file = await this.fileModel.findById(id).catch(() => {
            throw new NotFoundException(`File không tồn tại.`);
        });
        return file;
    }

    async findAll(query = {}): Promise<IGridFSObject[]> {
        const where = this.buildWhereQuery(query);
        console.log({ where: JSON.stringify(where) });
        return await this.fileModel.find(where);
    }

    async deleteFile(id: string): Promise<boolean> {
        return await this.fileModel.delete(id);
    }

    private buildWhereQuery(query: any = {}) {
        const { userId, ids } = query;
        const where: any = {};
        if (userId) {
            where['metadata.userId'] = userId;
        }

        if (_.isArray(ids)) {
            where._id = new ObjectId('6447f5b1d8dbfc231901d018');
        }
        return where;
    }
}
