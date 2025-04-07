import { Request, Response } from 'express';
import User from '../db/user';
import bcrypt from 'bcrypt';
import Message from '../db/message';
import Token from '../db/token';
import { encrypt } from '../utils/crypto';
import { sendMessage } from '../utils/mail';

export const changePassword = async (req: Request, res: Response): Promise<void> => {
	if (!req.user) {
		res.status(401).send('Not allowed');
		return;
	}

	const userId = req.user?.id;

	const user = await User.findById(userId);

	if (!user) {
		res.status(404).send('User not found');
		return;
	}

	const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);

	if (!isMatch) {
		res.status(400).send('Incorrect old password');
		return;
	}

	const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

	user.password = hashedPassword;

	await user.save();

	res.status(200).send('Password updated successfully');
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
	const token = req.body.token as string;

	if (!token) {
		res.status(400).send('Missing token');
		return;
	}

	const record = await Token.findOne({ token: token });

	if (!record) {
		res.status(404).send('Invalid or expired token');
		return;
	}

	const newPassword = await bcrypt.hash(req.body.password, 10);

	await User.updateOne({ email: record.email }, { $set: { password: newPassword } });
	await Token.deleteOne({ token: token });

	res.status(200).send('Success');
};

export const putMessage = async (req: Request, res: Response): Promise<void> => {
	if (!req.user) {
		res.status(401).send('Not allowed');
		return;
	}

	const encryptedText = encrypt(req.body.text);

	await Message.updateOne(
		{ _id: req.body.id, userId: req.user.id },
		{
			$set: {
				to: req.body.to,
				subject: req.body.subject,
				text: encryptedText,
				updatedAt: new Date()
			}
		}
	);

	if (req.body.sendPreview) {
		const user = await User.findOne({ _id: req.user.id }).select('email -_id');

		if (!user) {
			res.status(404).send('Preview message couldn\'t be sent because user not found');
			return;
		}

		await sendMessage({
			mailTo: user.email,
			mailSubject: req.body.subject,
			mailText: req.body.text
		});
	}

	res.status(200).send('Success');
};

export const putUser = async (req: Request, res: Response): Promise<void> => {
	if (!req.user || req.user.id !== req.params.user) {
		res.status(401).send('Not allowed');
		return;
	}

	await User.updateOne(
		{ _id: req.user.id },
		{
			$set: {
				name: req.body.name,
				email: req.body.email,
				password: req.body.password,
				notification: req.body.notification,
				confirmation: req.body.confirmation,
				notificationCounter: req.body.notification,
				confirmationCounter: req.body.confirmation,
				updatedAt: new Date()
			}
		}
	);

	res.status(200).send('Success');
};
