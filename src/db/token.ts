import { Schema, model } from 'mongoose';

interface IToken {
	email: string;
	token: string;
	confirmation?: number;
	notification?: number;
}

const TokenSchema = new Schema<IToken>({
	email: { type: String, required: true },
	token: { type: String, required: true }
});

const Token = model<IToken>('Token', TokenSchema);

export default Token;
