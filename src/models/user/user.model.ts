import { Document } from 'mongoose';

export interface UserModel extends Document {
    created: Date;
    username: string;
    password: string;
    twoFactorAuthSecret: string;
    twoFactorSecretConfirmed: boolean;
}
