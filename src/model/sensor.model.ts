import { Document, Schema } from 'mongoose';

export interface SensorModel extends Document {
    created: Date;
    host: string;
    name: string;
    port: number;
    pin: number;
    targetId: any;
}

export const SensorSchema = new Schema({
    created: {type: Date, default: Date.now()},
    host: String,
    name: String,
    port: Number,
    pin: Number,
    targetId: {type: Schema.Types.ObjectId, ref: 'switch'},
});
