import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';

export type UserDocument = User & Document;
@Schema({
    timestamps: true,
    collection: MongoCollection.USER,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class User extends MongoBaseSchema {
    _id: string;
    id?: string;

    @Prop({ required: true, unique: true, type: String })
    username: string;

    @Prop({ required: true, type: Types.ObjectId })
    roleId: ObjectId;

    @Prop({ required: false, type: String })
    avatarId: string;

    @Prop({ required: false, type: String })
    coverId: string;

    @Prop({ required: true, type: String })
    fullName: string;

    @Prop({ required: true, type: String })
    password: string;

    @Prop({ required: false, type: String })
    email: string;

    @Prop({ required: false, type: String })
    phone: string;

    @Prop({ required: false, default: true, type: Boolean })
    active: boolean;

    @Prop({ required: false, default: Date.now, type: Date })
    lastOnlineAt: string;

    @Prop({ required: false, type: String })
    describe: string;

    @Prop({ required: true, default: false, type: Boolean })
    private: boolean;

    @Prop({ required: true, default: 0, type: Number })
    point: number;

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
    })
    subscriberIds: ObjectId[];

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
    })
    subscribingIds: ObjectId[];

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
    })
    blockedIds: ObjectId[];

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        ref: 'Group',
    })
    groupIds: ObjectId[];

    @Prop({ required: false, type: String })
    lastRefreshToken: string;

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        ref: 'Tag',
    })
    tagIds: ObjectId[];

    @Prop({ required: false, type: Date })
    lastLimitedAt: Date;

    @Prop({ required: false, default: 5, type: Number })
    alertRange: number;
}

const BaseUserSchema = SchemaFactory.createForClass(User);
export const UserSchema = BaseUserSchema;
