import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as _Schema } from 'mongoose';
import { MongoCollection } from './constant';

export type ConfigDocument = Config & Document;

@Schema({
    timestamps: true,
    collection: MongoCollection.CONFIG,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class Config {
    _id: string;

    @Prop({ required: true, type: String })
    key: string;

    @Prop({ required: true, type: _Schema.Types.Mixed })
    value: unknown;
}

const BaseConfigSchema = SchemaFactory.createForClass(Config);
export const ConfigSchema = BaseConfigSchema;
