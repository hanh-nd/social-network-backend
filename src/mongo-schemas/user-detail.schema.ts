import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { Gender, Relationship } from 'src/common/constants';
import { Address, AddressSchema } from './address.schema';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { UserEducation, UserEducationSchema } from './user-education.schema';
import { UserWork, UserWorkSchema } from './user-work.schema';

export type UserDetailDocument = UserDetail & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.USER_DETAIL,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class UserDetail extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    userId: ObjectId;

    @Prop({ required: false, type: String, default: Gender.OTHER })
    gender: Gender;

    @Prop({ required: false, type: Date })
    birthday: Date;

    @Prop({ required: false, type: String })
    dob: string;

    @Prop({ required: false, type: AddressSchema })
    address: Address;

    @Prop({ required: false, type: String })
    relationship: Relationship;

    @Prop({ required: false, type: UserWorkSchema })
    work: UserWork;

    @Prop({ required: false, type: UserEducationSchema })
    education: UserEducation;
}

const BaseUserDetailSchema = SchemaFactory.createForClass(UserDetail);
export const UserDetailSchema = BaseUserDetailSchema;
