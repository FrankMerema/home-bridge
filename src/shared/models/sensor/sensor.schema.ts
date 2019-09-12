import { Schema } from 'mongoose';

export const SensorSchema = new Schema(
  {
    host: { type: Schema.Types.ObjectId, ref: 'host' },
    name: { type: String, unique: true },
    pin: Number,
    targetId: { type: Schema.Types.ObjectId, ref: 'switch' }
  },
  {
    timestamps: { createdAt: 'created', updatedAt: false }
  }
);

SensorSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  depopulate: true,
  transform: (doc: any, converted: any) => {
    delete converted.created;
    delete converted._id;
  }
});
