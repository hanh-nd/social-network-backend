import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User, UserSchema } from './user.schema';
import { Document } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.CHAT,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class Chat extends MongoBaseSchema {
    _id: string;

    @Prop({ required: false, type: String })
    name: string;

    @Prop({ required: false, type: String, alias: 'avatarId' })
    avatar_id: string;

    @Prop({ required: true, type: [UserSchema] })
    members: User[];

    @Prop({ required: false, type: String })
    type: string;
}

const BaseChatSchema = SchemaFactory.createForClass(Chat);
export const ChatSchema = BaseChatSchema;
