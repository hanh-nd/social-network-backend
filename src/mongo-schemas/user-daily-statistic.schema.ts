import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Document, Types } from 'mongoose';
import { MongoCollection } from './constant';
import { MongoBaseSchema } from './mongo.base.schema';

export type UserDailyStatisticDocument = UserDailyStatistic & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.USER_DAILY_STATISTIC,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class UserDailyStatistic extends MongoBaseSchema {
    _id: string;

    @Prop({ required: true, type: Types.ObjectId })
    userId: ObjectId;

    @Prop({ required: true, default: 0, type: Number })
    spentTimeSecond: number;

    @Prop({ required: false, default: 0, type: Number })
    point: number;
}

const BaseUserDailyStatisticSchema = SchemaFactory.createForClass(UserDailyStatistic);
export const UserDailyStatisticSchema = BaseUserDailyStatisticSchema;
