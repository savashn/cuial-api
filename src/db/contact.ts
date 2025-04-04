import { Schema, model } from 'mongoose';

interface IContact {
	name: string;
	email: string;
	message: string;
}

const contactSchema = new Schema<IContact>(
	{
		name: { type: String, required: true },
		email: { type: String, required: false, default: undefined },
		message: { type: String, required: true }
	},
	{ timestamps: true }
);

const Contact = model<IContact>('Contact', contactSchema);

export default Contact;
