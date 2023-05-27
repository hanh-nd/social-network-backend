import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoCollection } from './constant';

export type UserEducationDocument = UserEducation & Document;

@Schema({
    timestamps: false,
    collection: MongoCollection.USER_EDUCATION,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class UserEducation {

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: false, type: String })
    major: string;
}

const BaseUserEducationSchema = SchemaFactory.createForClass(UserEducation);
export const UserEducationSchema = BaseUserEducationSchema;
