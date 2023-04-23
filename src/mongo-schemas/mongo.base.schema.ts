import { Prop } from '@nestjs/mongoose';

export class MongoBaseSchema {
    @Prop({ required: false, default: null, type: Date })
    createdAt: string;

    @Prop({ required: false, default: null, type: Date })
    updatedAt: string;

    @Prop({ required: false, default: null, type: Date })
    deletedAt?: string;
}
