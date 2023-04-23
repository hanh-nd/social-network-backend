import { Prop } from '@nestjs/mongoose';

export class MongoBaseSchema {
    @Prop({ required: false, default: null, type: Date, alias: 'createdAt' })
    created_at: Date;

    @Prop({ required: false, default: null, type: Date, alias: 'updatedAt' })
    updated_at: Date;

    @Prop({ required: false, default: null, type: Date, alias: 'deletedAt' })
    deleted_at?: Date;
}
