import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { SubscribeRequestStatus } from 'src/common/constants';
import { MongoCollection } from './constant';
import { Group } from './group.schema';
import { MongoBaseSchema } from './mongo.base.schema';
import { Post } from './post.schema';
import { User } from './user.schema';

export type GroupPostDocument = GroupPost & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.GROUP_POSTS,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class GroupPost extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    author: Partial<User>;

    @Prop({ required: true, type: Types.ObjectId, ref: Post.name })
    post: Partial<Post>;

    @Prop({ required: true, type: Types.ObjectId, ref: Group.name })
    group: Partial<Group>;

    @Prop({ required: true, type: Number, default: SubscribeRequestStatus.PENDING })
    status: number;
}

const BaseGroupPostSchema = SchemaFactory.createForClass(GroupPost);
export const GroupPostSchema = BaseGroupPostSchema;
