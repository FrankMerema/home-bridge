import { Schema } from 'mongoose';

export const UserSchema = new Schema({
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        twoFactorAuthSecret: {
            type: String
        },
        twoFactorSecretConfirmed: {
            type: Boolean,
            default: false,
            required: true
        }
    },
    {
        timestamps: {createdAt: 'created', updatedAt: false}
    });
