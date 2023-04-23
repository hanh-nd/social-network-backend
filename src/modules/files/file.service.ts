import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { MongoGridFS } from 'mongo-gridfs';
import { Db, GridFSBucketReadStream } from 'mongodb';
import { Connection } from 'mongoose';

@Injectable()
export class FilesService {
    private fileModel: MongoGridFS;

    constructor(@InjectConnection() private readonly connection: Connection) {
        this.fileModel = new MongoGridFS(this.connection.db as unknown as Db, 'fs');
    }

    async readStream(id: string): Promise<GridFSBucketReadStream> {
        return await this.fileModel.readFileStream(id);
    }

    async findInfo(id: string): Promise<any> {
        const result = await this.fileModel
            .findById(id)
            .catch((err) => {
                throw new HttpException('File not found', HttpStatus.NOT_FOUND);
            })
            .then((result) => result);
        return {
            filename: result.filename,
            length: result.length,
            chunkSize: result.chunkSize,
            md5: result.md5,
            contentType: result.contentType,
        };
    }

    async deleteFile(id: string): Promise<boolean> {
        return await this.fileModel.delete(id);
    }
}
