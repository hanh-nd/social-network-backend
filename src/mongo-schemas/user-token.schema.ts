import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';

export type UserTokenDocument = UserToken & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.USER_TOKEN,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class UserToken extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: Types.ObjectId })
    userId: ObjectId;

    @Prop({ required: true, type: String })
    token: string;

    @Prop({ required: true, type: Date })
    expiredIn: string;
}

const BaseUserTokenSchema = SchemaFactory.createForClass(UserToken);
export const UserTokenSchema = BaseUserTokenSchema;
