import { Document, Schema } from 'mongoose';

export type LogType = 'WebServerRequest';

export interface LogModel extends Document {
    created: Date;
    message: string;
    type: LogType
}

export const LogSchema = new Schema({
        message: String,
        type: String
    },
    {
        timestamps: {createdAt: 'created', updatedAt: false}
    });

LogSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (doc: any, converted: any) => {
        delete converted._id;
    }
});
