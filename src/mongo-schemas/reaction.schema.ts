import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReactionType } from 'src/common/constants';
import { ReactionTarget } from 'src/common/interfaces';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User } from './user.schema';

export type ReactionDocument = Reaction & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.REACTION,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class Reaction extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    author: Partial<User>;

    @Prop({ required: true, type: Types.ObjectId, refPath: 'targetType' })
    target: Partial<ReactionTarget>;

    @Prop({ required: true, type: String })
    targetType: string;

    @Prop({ required: true, type: String })
    type: ReactionType;
}

const BaseReactionSchema = SchemaFactory.createForClass(Reaction);
export const ReactionSchema = BaseReactionSchema;
