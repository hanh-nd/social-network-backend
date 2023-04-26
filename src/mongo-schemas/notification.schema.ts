import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User } from './user.schema';

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

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    author: Partial<User>;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    to: Partial<User>;

    @Prop({ required: true, type: Types.ObjectId })
    targetId: ObjectId;

    @Prop({ required: true, type: String })
    targetType: string;

    @Prop({ required: true, default: false, type: Boolean })
    isRead: boolean;
}

const BaseNotificationSchema = SchemaFactory.createForClass(Notification);
export const NotificationSchema = BaseNotificationSchema;
