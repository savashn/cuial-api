import { Request, Response } from 'express';
import User from '../db/user';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Message from '../db/message';
import { encrypt } from '../utils/crypto';
import { sendToken } from '../utils/mail';
import Contact from '../db/contact';

export const register = async (req: Request, res: Response): Promise<void> => {
	const user = await User.findOne({ email: req.body.email });

	if (user) {
		res.status(409).json({
			message: 'This user already exists'
		});
		return;
	}

	const hashedPassword = await bcrypt.hash(req.body.password, 10);

	const newUser = new User({
		name: req.body.name,
		email: req.body.email,
		password: hashedPassword
	});

	await newUser.save();

	const msg = {
		email: req.body.email as string,
		type: 'verify',
		query: 'account',
		mailSubject: 'Verify Your Account',
		mailText: 'Please click the button below to verify your CUIAL account.'
	};

	await sendToken(msg);

	res.status(201).send('Successfully sent a verification link to your email address');
};

export const login = async (req: Request, res: Response): Promise<void> => {
	const user = await User.findOne({ email: req.body.email });

	if (!user) {
		res.status(404).json({
			message: 'There is no such a user'
		});
		return;
	} else if (user.isVerified === false) {
		res.status(400).json({
			message: 'Your account has not been verified yet'
		});
		return;
	}

	const isSuccess = await bcrypt.compare(req.body.password, user.password);

	if (!isSuccess) {
		res.status(400).json({
			message: 'Invalid email or password'
		});
		return;
	}

	const token: string = jwt.sign(
		{ id: user.id, name: user.name },
		process.env.JWT_SECRET as string,
		{
			expiresIn: '1d'
		}
	);

	res.status(200).send(token);
};

export const message = async (req: Request, res: Response): Promise<void> => {
	if (!req.user) {
		res.status(500).send('An error occured while deleting the user');
		return;
	}

	const text = encrypt(req.body.text);

	const message = new Message({
		to: req.body.to,
		subject: req.body.subject,
		text: text,
		userId: req.user.id
	});

	await message.save();

	await User.updateOne({ _id: req.user.id }, { $inc: { messages: 1 } });

	res.status(201).send('Success!');
};

export const contact = async (req: Request, res: Response): Promise<void> => {
	await Contact.create({
		name: req.body.name,
		email: req.body.email || undefined,
		message: req.body.message
	});

	res.status(200).send('Your message has been delivered to the management');
};
