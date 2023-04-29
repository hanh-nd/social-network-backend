import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { Privacy } from 'src/common/constants';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User } from './user.schema';

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
    id?: string;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name, index: true })
    author: Partial<User>;

    @Prop({ required: true, type: String })
    content: string;

    @Prop({ required: true, default: Privacy.PUBLIC, type: Number })
    privacy: number;

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        ref: User.name,
    })
    commentIds: ObjectId[];

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        ref: User.name,
    })
    reactIds: ObjectId[];

    @Prop({
        required: true,
        default: [],
        type: [Types.ObjectId],
        ref: User.name,
    })
    sharedIds: ObjectId[];

    @Prop({
        required: false,
        type: Types.ObjectId,
    })
    postShared: Partial<Post>;

    @Prop({ required: false, type: Types.ObjectId, ref: User.name })
    discussedIn: Partial<User>;

    @Prop({ required: false, type: [Types.ObjectId] })
    pictureIds: ObjectId[];

    @Prop({ required: false, type: [Types.ObjectId] })
    videoIds: ObjectId[];

    @Prop({ required: true, default: 0, type: Number, index: true })
    point: number;

    @Prop({ required: false, default: false, type: Boolean })
    isDeletedBySystem: boolean;
}

const BasePostSchema = SchemaFactory.createForClass(Post);
export const PostSchema = BasePostSchema;
