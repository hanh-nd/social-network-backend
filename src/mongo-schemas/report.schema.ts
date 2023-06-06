import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ReportAction } from 'src/common/constants';
import { ReportTarget } from 'src/common/interfaces';
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

    @Prop({ required: true, type: Types.ObjectId, refPath: 'targetType' })
    target: Partial<ReportTarget>;

    @Prop({ required: true, type: String })
    targetType: string;

    @Prop({ required: true, default: ReportAction.PENDING, type: String })
    action: ReportAction;

    @Prop({ required: true, type: String })
    reportReason: string;

    @Prop({ required: false, type: String })
    note: string;
}

const BaseReportSchema = SchemaFactory.createForClass(Report);
export const ReportSchema = BaseReportSchema;
