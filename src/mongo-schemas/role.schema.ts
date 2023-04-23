import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';

export type RoleDocument = Role & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.ROLE,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class Role extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: true, default: [], type: [String] })
    permissions: string[];
}

const BaseRoleSchema = SchemaFactory.createForClass(Role);
export const RoleSchema = BaseRoleSchema;
