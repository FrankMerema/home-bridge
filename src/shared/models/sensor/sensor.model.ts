import { Document } from 'mongoose';

export interface SensorModel extends Document {
    created: Date;
    host: any;
    name: string;
    pin: number;
    targetId: any;
}
