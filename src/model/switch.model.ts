import { Document, Schema } from 'mongoose';
import { StateHistory } from './state-history.model';
import { State } from './state.enum';

export interface SwitchModel extends Document {
    created: Date;
    host: string;
    port: number;
    name: string;
    pin: number;
    state: State;
    stateHistory: Array<StateHistory>;
}

export const SwitchSchema = new Schema({
    _id: Schema.Types.ObjectId,
    created: {type: Date, default: Date.now()},
    host: String,
    port: Number,
    name: String,
    pin: Number,
    state: Number,
    stateHistory: {type: Array, default: []}
});
