import { Schema } from 'mongoose';

export const UserSchema = new Schema(
  {
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
    timestamps: { createdAt: 'created', updatedAt: false }
  }
);

UserSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc: any, converted: any) => {
    delete converted.created;
    delete converted._id;
    delete converted.password;
    delete converted.twoFactorAuthSecret;
  }
});
