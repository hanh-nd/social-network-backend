import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User, UserSchema } from './user.schema';

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

    @Prop({ required: false, type: String, alias: 'name' })
    name: string;

    @Prop({ required: false, type: String, alias: 'avatarId' })
    avatar_id: string;

    @Prop({ required: true, type: [UserSchema], alias: 'members' })
    members: User[];

    @Prop({ required: false, type: String, alias: 'type' })
    type: string;
}

const BaseChatSchema = SchemaFactory.createForClass(Chat);
export const ChatSchema = BaseChatSchema;
