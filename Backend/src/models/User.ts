import { Schema, model } from 'mongoose';

interface IUser {
  username: string;
  password: string;
  isAdmin?: boolean;
}

const userSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

export default model<IUser>('User', userSchema);
