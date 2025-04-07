import { Schema, model, Types } from 'mongoose';

interface IMessage {
	to: string;
	subject: string;
	text: string;
	userId: Types.ObjectId;
}

const messageSchema = new Schema<IMessage>(
	{
		to: {
			type: String,
			required: true
		},
		subject: {
			type: String,
			required: true
		},
		text: {
			type: String,
			required: true
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true
		}
	},
	{ timestamps: true }
);

const Message = model<IMessage>('Message', messageSchema);

export default Message;
