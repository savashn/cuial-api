import { Schema, model } from 'mongoose';

interface IUser {
	name: string;
	email: string;
	password: string;
	messages: number;
	notification: number;
	confirmation: number;
	notificationCounter: number;
	confirmationCounter: number;
	isVerified: boolean;
	isAlive: boolean;
}

const userSchema = new Schema<IUser>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true },
		password: { type: String, required: true },
		messages: { type: Number, required: true, default: 0 },
		notification: { type: Number, required: true, default: 30 },
		confirmation: { type: Number, required: true, default: 3 },
		notificationCounter: { type: Number, required: true, default: 30 },
		confirmationCounter: { type: Number, required: true, default: 3 },
		isVerified: { type: Boolean, required: true, default: false },
		isAlive: { type: Boolean, required: true, default: true }
	},
	{ timestamps: true }
);

userSchema.index({ isVerified: 1 });

const User = model<IUser>('User', userSchema);

export default User;
