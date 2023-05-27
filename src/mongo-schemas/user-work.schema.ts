import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoCollection } from './constant';

export type UserWorkDocument = UserWork & Document;

@Schema({
    timestamps: false,
    collection: MongoCollection.USER_WORK,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class UserWork {
    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: false, type: String })
    position: string;
}

const BaseUserWorkSchema = SchemaFactory.createForClass(UserWork);
export const UserWorkSchema = BaseUserWorkSchema;
