import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationTarget } from 'src/common/interfaces';
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

    @Prop({ required: false, type: Types.ObjectId, ref: User.name })
    author: Partial<User>;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    to: Partial<User>;

    @Prop({ required: false, type: Types.ObjectId, refPath: 'targetType' })
    target: Partial<NotificationTarget>;

    @Prop({ required: true, type: String })
    targetType: string;

    @Prop({ required: true, type: String })
    action: string;

    @Prop({ required: true, default: false, type: Boolean })
    isRead: boolean;

    @Prop({ type: String, required: false })
    content: string;

    @Prop({ type: Object, default: null })
    additionalData: object;

    @Prop({ type: Boolean, default: false })
    urgent: boolean;
}

const BaseNotificationSchema = SchemaFactory.createForClass(Notification);
export const NotificationSchema = BaseNotificationSchema;
