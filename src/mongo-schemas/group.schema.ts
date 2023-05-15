import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { User } from '.';
import { Administrator, AdministratorSchema } from './administrator.schema';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';

export type GroupDocument = Group & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.GROUP,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class Group extends MongoBaseSchema {
    _id: string;
    id?: string;

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: [AdministratorSchema], default: [] })
    administrators: Administrator[];

    @Prop({ type: Boolean, default: false })
    private: boolean;

    @Prop({ type: Boolean, default: false })
    reviewPost: boolean;

    @Prop({ type: String, required: false })
    summary: string;

    @Prop({ type: Types.ObjectId, required: false })
    coverId: ObjectId;

    @Prop({ type: [Types.ObjectId], default: [], ref: 'User' })
    memberIds: ObjectId[];

    @Prop({ type: [Types.ObjectId], default: [], ref: 'GroupPost' })
    pinnedPosts: ObjectId[];

    @Prop({ type: [Types.ObjectId], default: [], ref: 'User' })
    blockIds: ObjectId[];
}

const BaseGroupSchema = SchemaFactory.createForClass(Group);
export const GroupSchema = BaseGroupSchema;
