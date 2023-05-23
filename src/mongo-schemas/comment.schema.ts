import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { Post } from './post.schema';
import { User } from './user.schema';

export type CommentDocument = Comment & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.COMMENT,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class Comment extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    author: Partial<User>;

    @Prop({ required: true, type: Types.ObjectId, ref: Post.name })
    post: Partial<Post>;

    @Prop({ required: true, type: String })
    content: string;

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        ref: User.name,
    })
    reactIds: ObjectId[];

    @Prop({ required: false, type: String })
    pictureId: string;

    @Prop({ required: false, type: String })
    videoId: string;

    @Prop({ required: true, default: 0, type: Number })
    point: number;
}

const BaseCommentSchema = SchemaFactory.createForClass(Comment);
export const CommentSchema = BaseCommentSchema;
