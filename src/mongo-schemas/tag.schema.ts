import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';

export type TagDocument = Tag & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.TAGS,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class Tag extends MongoBaseSchema {
    _id: string;

    @Prop({ type: String })
    code: string;

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: false, type: Types.ObjectId })
    iconId: ObjectId;
}

const BaseTagSchema = SchemaFactory.createForClass(Tag);
export const TagSchema = BaseTagSchema;
