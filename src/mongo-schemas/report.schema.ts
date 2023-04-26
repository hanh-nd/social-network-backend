import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';
import { User } from './user.schema';

export type ReportDocument = Report & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.REPORT,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class Report extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    author: Partial<User>;

    @Prop({ required: true, type: Types.ObjectId })
    targetId: ObjectId;

    @Prop({ required: true, type: String })
    targetType: string;

    @Prop({ required: true, type: String })
    action: string;
}

const BaseReportSchema = SchemaFactory.createForClass(Report);
export const ReportSchema = BaseReportSchema;
