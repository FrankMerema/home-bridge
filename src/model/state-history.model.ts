import {State} from './state.enum';

export interface StateHistory {
    state: State;
    executed: Date;
    executedBy: string;
}
