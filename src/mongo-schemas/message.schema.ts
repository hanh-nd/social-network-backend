import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Chat, ChatSchema } from './chat.schema';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User, UserSchema } from './user.schema';
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

    @Prop({ required: true, type: UserSchema })
    author: User;

    @Prop({ required: true, type: ChatSchema })
    chat: Chat;

    @Prop({ required: true, type: String })
    content: string;

    @Prop({
        required: false,
        default: false,
        type: Boolean,
        alias: 'isRecalled',
    })
    is_recalled: string;
}

const BaseMessageSchema = SchemaFactory.createForClass(Message);
export const MessageSchema = BaseMessageSchema;
