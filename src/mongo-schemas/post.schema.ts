import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Types, Document } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User, UserSchema } from './user.schema';

export type PostDocument = Post & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.POST,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class Post extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: UserSchema })
    author: User;

    @Prop({ required: true, type: String })
    content: string;

    @Prop({ required: true, default: true, type: Boolean })
    privacy: boolean;

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        alias: 'commentIds',
    })
    comment_ids: ObjectId[];

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        alias: 'reactIds',
    })
    react_ids: ObjectId[];

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        alias: 'sharedIds',
    })
    shared_ids: ObjectId[];

    @Prop({ required: false, type: Types.ObjectId, alias: 'postShared' })
    post_shared: Post;

    @Prop({ required: false, type: UserSchema, alias: 'discussedIn' })
    discussed_in: User;

    @Prop({ required: false, type: [String], alias: 'pictureIds' })
    picture_ids: string[];

    @Prop({ required: false, type: [String], alias: 'videoIds' })
    video_ids: string[];

    @Prop({ required: true, default: 0, type: Number })
    point: number;
}

const BasePostSchema = SchemaFactory.createForClass(Post);
export const PostSchema = BasePostSchema;
