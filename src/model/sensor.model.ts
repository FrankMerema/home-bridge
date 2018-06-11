import { Document, Schema } from 'mongoose';

export interface SensorModel extends Document {
    created: Date;
    host: any;
    name: string;
    pin: number;
    targetId: any;
}

export const SensorSchema = new Schema({
        host: {type: Schema.Types.ObjectId, ref: 'host'},
        name: String,
        pin: Number,
        targetId: {type: Schema.Types.ObjectId, ref: 'switch'},
    },
    {
        timestamps: {createdAt: 'created', updatedAt: false}
    });

SensorSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    depopulate: true,
    transform: (doc: any, converted: any) => {
        delete converted.created;
        delete converted._id;
    }
});
