import { Schema } from 'mongoose';

export const SwitchSchema = new Schema({
        host: {type: Schema.Types.ObjectId, ref: 'host'},
        name: {type: String, unique: true},
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
