import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SurveyType } from 'src/modules/surveys/surveys.constants';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';

export type SurveyDocument = Survey & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.SURVEY,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class Survey extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: String })
    name: string;

    @Prop({ required: false, type: String })
    description: string;

    @Prop({ required: true, type: String })
    type: SurveyType;

    @Prop({ required: true, type: String })
    question: string;

    @Prop({ required: true, type: Date })
    askDate: Date;

    @Prop({ required: true, type: Boolean })
    urgent: boolean;

    @Prop({ required: false, type: Object })
    filter: Object;
}

const BaseSurveySchema = SchemaFactory.createForClass(Survey);
export const SurveySchema = BaseSurveySchema;
