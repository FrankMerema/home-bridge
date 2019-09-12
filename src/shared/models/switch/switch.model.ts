import { State, StateHistory } from '@shared/models';
import { Document } from 'mongoose';

export interface SwitchModel extends Document {
  created: Date;
  host: any;
  name: string;
  pin: number;
  state: State;
  stateHistory: StateHistory[];
}
