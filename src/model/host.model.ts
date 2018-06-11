import { Document, Schema } from 'mongoose';

export type HostStatus = 'online' | 'offline';

export interface HostModel extends Document {
    created: Date;
    name: string;
    hostName: string;
    ip: string;
    port: number;
    status: HostStatus;
}

export const HostSchema = new Schema({
        name: String,
        hostName: String,
        ip: String,
        port: Number,
        status: String,
    },
    {
        timestamps: {createdAt: 'created', updatedAt: false}
    });

export const HostDto = {
    id: '$_id',
    name: true,
    hostName: true,
    status: true,
    _id: false,
};

HostSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc: any, converted: any) => {
        delete converted.created;
        delete converted._id;
    }
});
