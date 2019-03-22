import { State } from '@shared/models';

export interface StateHistory {
    state: State;
    executed: Date;
    executedBy: string;
}
