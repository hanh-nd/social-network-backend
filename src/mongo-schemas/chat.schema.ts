import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User } from './user.schema';

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

    @Prop({ required: false, type: String })
    avatarId: string;

    @Prop({ required: true, type: [Types.ObjectId], ref: User.name })
    members: Partial<User>[];

    @Prop({ required: false, type: String })
    type: string;
}

const BaseChatSchema = SchemaFactory.createForClass(Chat);
export const ChatSchema = BaseChatSchema;
