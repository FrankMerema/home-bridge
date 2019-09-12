import { Schema } from 'mongoose';

export const HostSchema = new Schema(
  {
    name: { type: String, unique: true },
    hostName: String,
    ip: String,
    port: Number,
    status: String
  },
  {
    timestamps: { createdAt: 'created', updatedAt: 'lastUpdated' }
  }
);

HostSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc: any, converted: any) => {
    delete converted.created;
    delete converted._id;
    delete converted.ip;
    delete converted.port;
  }
});
