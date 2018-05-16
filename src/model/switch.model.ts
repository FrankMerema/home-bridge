import { Document, Schema } from 'mongoose';
import { State } from './state.enum';

export interface StateHistory {
    state: State;
    executed: Date;
    executedBy: string;
}

export interface SwitchModel extends Document {
    created: Date;
    direction: string;
    host: string;
    port: number;
    name: string;
    pin: number;
    state: State;
    stateHistory: Array<StateHistory>;
}

export const SwitchSchema = new Schema({
    created: {type: Date, default: Date.now()},
    direction: String,
    host: String,
    port: Number,
    name: String,
    pin: Number,
    state: Number,
    stateHistory: {type: Array, default: []}
});
