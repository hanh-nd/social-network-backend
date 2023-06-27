import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
    timestamps: false,
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    versionKey: false,
})
export class Address {
    @Prop({ required: false, type: String })
    province: string;

    @Prop({ required: false, type: String })
    district: string;

    @Prop({ required: false, type: String })
    ward: string;

    @Prop({ required: false, type: String })
    detail?: string;
}
const BaseAddressSchema = SchemaFactory.createForClass(Address);
export const AddressSchema = BaseAddressSchema;
