import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';

export type AskUserQuestionDocument = AskUserQuestion & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.ASK_USER_QUESTIONS,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class AskUserQuestion extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    sender: ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    receiver: ObjectId;

    @Prop({ default: false, type: Boolean })
    isAnonymous: boolean;

    @Prop({ required: true, type: String })
    question: string;

    @Prop({ required: false, type: String, default: null })
    answer: string;
}

const BaseAskUserQuestionSchema = SchemaFactory.createForClass(AskUserQuestion);
export const AskUserQuestionSchema = BaseAskUserQuestionSchema;
