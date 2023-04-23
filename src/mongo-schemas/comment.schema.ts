import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Types } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User, UserSchema } from './user.schema';
import { Post, PostSchema } from './post.schema';

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

    @Prop({ required: true, type: UserSchema, alias: 'author' })
    author: User;

    @Prop({ required: true, type: PostSchema, alias: 'post' })
    post: Post;

    @Prop({ required: true, type: String, alias: 'content' })
    content: string;

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        alias: 'reactIds',
    })
    react_ids: ObjectId[];

    @Prop({ required: false, type: String, alias: 'pictureId' })
    picture_id: string;

    @Prop({ required: false, type: String, alias: 'videoId' })
    video_id: string;

    @Prop({ required: true, default: 0, type: Number, alias: 'point' })
    point: number;
}

const BaseCommentSchema = SchemaFactory.createForClass(Comment);
export const CommentSchema = BaseCommentSchema;
