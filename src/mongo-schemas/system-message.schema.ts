import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';

export type SystemMessageDocument = SystemMessage & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.USER_DAILY_STATISTIC,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class SystemMessage extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: String, unique: true })
    code: string;

    @Prop({ required: true, type: String })
    template: string;

    @Prop({ required: false, type: String })
    fullTemplate: string;

    @Prop({ required: false, type: String })
    type: string;
}

const BaseSystemMessageSchema = SchemaFactory.createForClass(SystemMessage);
export const SystemMessageSchema = BaseSystemMessageSchema;
