import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Chat } from './chat.schema';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User } from './user.schema';
export type MessageDocument = Message & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.MESSAGE,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class Message extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    author: Partial<User>;

    @Prop({ required: true, type: Types.ObjectId, ref: Chat.name })
    chat: Partial<Chat>;

    @Prop({ required: true, type: String })
    content: string;

    @Prop({
        required: false,
        default: false,
        type: Boolean,
    })
    isRecalled: boolean;
}

const BaseMessageSchema = SchemaFactory.createForClass(Message);
export const MessageSchema = BaseMessageSchema;
