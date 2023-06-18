import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';

export type SurveyAnswerDocument = SurveyAnswer & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.SURVEY_ANSWER,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class SurveyAnswer extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: Types.ObjectId, ref: 'Survey' })
    survey: ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
    user: ObjectId;

    @Prop({ required: true, type: String })
    answer: string;

    @Prop({ required: false, type: Object })
    additionalData: Object;
}

const BaseSurveyAnswerSchema = SchemaFactory.createForClass(SurveyAnswer);
export const SurveyAnswerSchema = BaseSurveyAnswerSchema;
