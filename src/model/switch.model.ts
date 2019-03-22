import { State, StateHistory } from '@shared/models';
import { Document, Schema } from 'mongoose';

export interface SwitchModel extends Document {
    created: Date;
    host: any;
    name: string;
    pin: number;
    state: State;
    stateHistory: Array<StateHistory>;
}

export const SwitchSchema = new Schema({
        host: {type: Schema.Types.ObjectId, ref: 'host'},
        name: String,
        pin: Number,
        state: Number,
        stateHistory: {type: Array, default: []}
    },
    {
        timestamps: {createdAt: 'created', updatedAt: false}
    });

SwitchSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    depopulate: true,
    transform: (doc: any, converted: any) => {
        delete converted.created;
        delete converted._id;
    }
});

