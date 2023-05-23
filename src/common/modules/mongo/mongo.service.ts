import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongoService {
    connection: Connection;
    constructor(@InjectConnection() connection: Connection) {
        this.connection = connection;
    }
}
