import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { Address, AddressSchema } from './address.schema';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';

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

    @Prop({ required: true, unique: true, type: String, alias: 'username' })
    username: string;

    @Prop({ required: true, type: Types.ObjectId, alias: 'roleId' })
    role_id: ObjectId;

    @Prop({ required: false, type: String, alias: 'avatarId' })
    avatar_id: string;

    @Prop({ required: false, type: String, alias: 'coverId' })
    cover_id: string;

    @Prop({ required: true, type: String, alias: 'fullName' })
    full_name: string;

    @Prop({ required: true, type: String, alias: 'password' })
    password: string;

    @Prop({ required: false, type: String, alias: 'email' })
    email: string;

    @Prop({ required: false, type: String, alias: 'phone' })
    phone: string;

    @Prop({ required: false, type: Date, alias: 'birthday' })
    birthday: Date;

    @Prop({ required: false, default: true, type: Boolean, alias: 'active' })
    active: boolean;

    @Prop({ required: false, type: Date, alias: 'lastOnlineAt' })
    last_online_at: Date;

    @Prop({ required: false, type: AddressSchema, alias: 'address' })
    address: Address;

    @Prop({ required: false, type: String, alias: 'describe' })
    describe: string;

    @Prop({ required: true, default: true, type: Boolean, alias: 'privacy' })
    privacy: boolean;

    @Prop({ required: true, default: 0, type: Number, alias: 'point' })
    point: number;

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        alias: 'subscriberIds',
    })
    subscriber_ids: ObjectId[];

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        alias: 'subscribingIds',
    })
    subscribing_ids: ObjectId[];

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        alias: 'blockedIds',
    })
    blocked_ids: ObjectId[];
}

const BaseUserSchema = SchemaFactory.createForClass(User);
export const UserSchema = BaseUserSchema;
