import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
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
        ref: MongoCollection.USER,
    })
    commentIds: ObjectId[];

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        ref: MongoCollection.USER,
    })
    reactIds: ObjectId[];

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        ref: MongoCollection.USER,
    })
    sharedIds: ObjectId[];

    @Prop({
        required: false,
        type: Types.ObjectId,
    })
    postShared: Post;

    @Prop({ required: false, type: UserSchema })
    discussedIn: User;

    @Prop({ required: false, type: [String] })
    pictureIds: string[];

    @Prop({ required: false, type: [String] })
    videoIds: string[];

    @Prop({ required: true, default: 0, type: Number })
    point: number;
}

const BasePostSchema = SchemaFactory.createForClass(Post);
export const PostSchema = BasePostSchema;
