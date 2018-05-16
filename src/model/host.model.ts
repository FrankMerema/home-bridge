import { Document, Schema } from 'mongoose';

export type HostStatus = 'online' | 'offline';

export interface HostModel extends Document {
    created: Date;
    hostName: string;
    ip: string;
    port: number;
    status: HostStatus;
}

export const HostSchema = new Schema({
    created: {type: Date, default: Date.now()},
    hostName: String,
    ip: String,
    port: Number,
    status: String
});
