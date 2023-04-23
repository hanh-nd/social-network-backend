import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Types, Document } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User, UserSchema } from './user.schema';

export type NotificationDocument = Notification & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.NOTIFICATION,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class Notification extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: UserSchema })
    author: User;

    @Prop({ required: true, type: UserSchema })
    to: User;

    @Prop({ required: true, type: Types.ObjectId, alias: 'targetId' })
    target_id: ObjectId;

    @Prop({ required: true, type: String, alias: 'targetType' })
    target_type: string;

    @Prop({ required: true, default: false, type: Boolean, alias: 'isRead' })
    is_read: boolean;
}

const BaseNotificationSchema = SchemaFactory.createForClass(Notification);
export const NotificationSchema = BaseNotificationSchema;
