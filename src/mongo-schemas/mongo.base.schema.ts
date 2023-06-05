import { Prop } from '@nestjs/mongoose';
import * as moment from 'moment';

export class MongoBaseSchema {
    @Prop({ required: false, default: () => moment().format('YYYYMMDD'), type: String, index: true })
    createdDate: string;

    @Prop({ required: false, default: () => moment().format('YYYYMM'), type: String, index: true })
    createdMonth: string;

    @Prop({ required: false, default: () => moment().format('YYYY'), type: String, index: true })
    createdYear: string;

    @Prop({ required: false, default: null, type: Date, index: true })
    createdAt: string;

    @Prop({ required: false, default: null, type: Date })
    updatedAt: string;

    @Prop({ required: false, default: null, type: Date })
    deletedAt?: string;
}
