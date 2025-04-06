import { Request, Response } from 'express';
import Message from '../db/message';
import { decrypt } from '../utils/crypto';
import User from '../db/user';
import { sendToken } from '../utils/mail';
import Token from '../db/token';

export const user = async (req: Request, res: Response): Promise<void> => {
	if (!req.user) {
		res.status(500).send('An error occured while deleting the user');
		return;
	}

	const user = await User.findOne({ _id: req.user.id });

	res.status(200).json(user);
};

export const messages = async (req: Request, res: Response): Promise<void> => {
	if (!req.user) {
		res.status(500).send('An error occured while deleting the user');
		return;
	}

	const messages = await Message.find({ userId: req.user.id });

	const decryptedMessages = messages.map((message) => {
		const decryptedMessage = message.toObject();

		try {
			decryptedMessage.text = decrypt(decryptedMessage.text);
		} catch (error) {
			console.error('Decryption error:', error);
			decryptedMessage.text = '[Decryption failed]';
		}

		return decryptedMessage;
	});

	res.status(200).send(decryptedMessages);
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
	const msg = {
		email: req.query.email as string,
		type: 'renew-password',
		query: 'token',
		mailSubject: 'Renew Password',
		mailText: 'Please click the button below to regenerate your password.'
	};

	await sendToken(msg);

	res.status(200).send('Regeneration password link has been sent to your mailbox');
};

export const checkToken = async (req: Request, res: Response): Promise<void> => {
	const token = await Token.findOne({ token: req.params.token });

	if (!token) {
		res.status(404).send('Invalid or expired token');
		return;
	}

	res.status(200).json({ success: true });
};

export const verify = async (req: Request, res: Response): Promise<void> => {
	if (!req.query) {
		res.status(500).send('Missing token');
		return;
	}

	const token = req.query.account || req.query.living;

	try {
		const record = await Token.findOne({ token: token });

		if (!record) {
			res.status(404).send('Invalid or expired token');
			return;
		}

		if (req.query.account) {
			await User.updateOne({ email: record.email }, { $set: { isVerified: true } });

			await Token.deleteOne({ token: token });

			res.status(200).send('Account is verified successfully');
			return;
		}

		if (req.query.living) {
			await User.updateOne(
				{ email: record.email },
				{
					$set: {
						confirmationCounter: record.confirmation,
						notificationCounter: record.notification
					}
				}
			);
			await Token.deleteOne({ token: token });

			res.status(200).send('Happy to see you alive');
			return;
		}
	} catch (err) {
		console.log(err);
		res.status(400).send('Invalid or expired token');
	}
};
