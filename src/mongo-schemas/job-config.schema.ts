import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';

export type JobConfigDocument = JobConfig & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.JOB_CONFIG,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class JobConfig extends MongoBaseSchema {
    _id: string;

    @Prop({ type: String })
    key: string;

    @Prop({ required: true, type: String })
    cronTime: string;

    @Prop({ required: false, default: true, type: Boolean })
    active: boolean;
}

const BaseJobConfigSchema = SchemaFactory.createForClass(JobConfig);
export const JobConfigSchema = BaseJobConfigSchema;
