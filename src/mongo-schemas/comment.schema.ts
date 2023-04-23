import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Types, Document } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User, UserSchema } from './user.schema';
import { Post, PostSchema } from './post.schema';

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

    @Prop({ required: true, type: UserSchema })
    author: User;

    @Prop({ required: true, type: PostSchema })
    post: Post;

    @Prop({ required: true, type: String })
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

    @Prop({ required: true, default: 0, type: Number })
    point: number;
}

const BaseCommentSchema = SchemaFactory.createForClass(Comment);
export const CommentSchema = BaseCommentSchema;
