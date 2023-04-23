import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Chat, ChatSchema } from './chat.schema';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User, UserSchema } from './user.schema';

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

    @Prop({ required: true, type: UserSchema, alias: 'author' })
    author: User;

    @Prop({ required: true, type: ChatSchema, alias: 'chat' })
    chat: Chat;

    @Prop({ required: true, type: String, alias: 'content' })
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
