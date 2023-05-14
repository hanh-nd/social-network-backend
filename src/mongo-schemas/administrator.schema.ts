import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from './user.schema';

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
export class Administrator {
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: Partial<User>;

    @Prop({ required: false, type: Boolean, default: false })
    isOwner: boolean;
}
const BaseAdministratorSchema = SchemaFactory.createForClass(Administrator);
export const AdministratorSchema = BaseAdministratorSchema;
