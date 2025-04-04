import { Request, Response } from 'express';
import User from '../db/user';
import Message from '../db/message';

export const user = async (req: Request, res: Response): Promise<void> => {
	const user = await User.findOneAndDelete({ _id: req.params.id });

	if (!user) {
		res.status(500).send('An error occured while deleting the user');
		return;
	}

	await Message.deleteMany({ userId: user._id });

	res.status(204).send();
};

export const message = async (req: Request, res: Response): Promise<void> => {
	if (!req.user) {
		res.status(500).send('An error occured while deleting the user');
		return;
	}

	await Message.deleteOne({ _id: req.body.id });
	await User.updateOne({ _id: req.user.id }, { $inc: { messages: -1 } });

	res.status(204).send();
};
