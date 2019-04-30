import { Document } from 'mongoose';
import { StateHistory } from '../generic/state-history.model';
import { State } from '../generic/state.enum';

export interface SwitchModel extends Document {
    created: Date;
    host: any;
    name: string;
    pin: number;
    state: State;
    stateHistory: StateHistory[];
}
