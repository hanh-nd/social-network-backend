import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { ChatType } from 'src/modules/chats/chat.constants';
import { Administrator, AdministratorSchema } from './administrator.schema';
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

    @Prop({ required: false, type: Types.ObjectId })
    avatarId: ObjectId;

    @Prop({ type: [AdministratorSchema], default: [] })
    administrators: Administrator[];

    @Prop({ required: true, type: [Types.ObjectId], ref: User.name, default: [] })
    members: Partial<User>[];

    @Prop({ required: false, type: [Types.ObjectId], ref: User.name, default: [] })
    blockedIds: Partial<User>[];

    @Prop({ required: false, type: String, default: ChatType.PRIVATE })
    type: ChatType;

    @Prop({ required: false, type: [Types.ObjectId], default: [] })
    deletedFor: Partial<User>[];

    @Prop({ required: false, default: null, type: Date })
    lastMessageAt: Date;
}

const BaseChatSchema = SchemaFactory.createForClass(Chat);
export const ChatSchema = BaseChatSchema;
