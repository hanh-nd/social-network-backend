import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SubscribeRequestStatus } from 'src/common/constants';
import { MongoCollection } from './constant';
import { Group } from './group.schema';
import { MongoBaseSchema } from './mongo.base.schema';
import { User } from './user.schema';

export type JoinRequestDocument = JoinRequest & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.JOIN_REQUEST,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class JoinRequest extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    sender: Partial<User>;

    @Prop({ required: true, type: Types.ObjectId, ref: Group.name })
    group: Partial<Group>;

    @Prop({ required: true, type: Number, default: SubscribeRequestStatus.PENDING })
    status: number;
}

const BaseJoinRequestSchema = SchemaFactory.createForClass(JoinRequest);
export const JoinRequestSchema = BaseJoinRequestSchema;
