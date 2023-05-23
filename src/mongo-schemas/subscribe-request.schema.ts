import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SubscribeRequestStatus } from 'src/common/constants';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User } from './user.schema';

export type SubscribeRequestDocument = SubscribeRequest & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.SUBSCRIBE_REQUEST,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class SubscribeRequest extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    sender: Partial<User>;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    receiver: Partial<User>;

    @Prop({ required: true, type: Number, default: SubscribeRequestStatus.PENDING })
    status: number;
}

const BaseSubscribeRequestSchema = SchemaFactory.createForClass(SubscribeRequest);
export const SubscribeRequestSchema = BaseSubscribeRequestSchema;
