import { Document } from 'mongoose';

export type HostStatus = 'online' | 'offline';

export interface HostModel extends Document {
  created: Date;
  lastUpdated: Date;
  name: string;
  hostName: string;
  ip: string;
  port: number;
  status: HostStatus;
}
