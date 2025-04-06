import User from '../db/user';
import Message from '../db/message';
import { sendMessage, sendToken } from './mail';
import { decrypt } from './crypto';

export default async function deadMansSwitch(): Promise<void> {
	const users = await User.find({
		isVerified: true,
		isAlive: true,
		messages: { $gt: 0 }
	});

	for (const user of users) {
		if (user.notificationCounter > 0) {
			user.notificationCounter--;

			if (user.notificationCounter === 0) {
				const msg = {
					email: user.email,
					type: 'verify',
					query: 'living',
					mailSubject: 'Verify that you are still alive',
					mailText: `Please click the button below to verify that you are still alive. If you will not click this verification link in ${user.confirmation} ${user.confirmation === 1 ? 'day' : 'days'}, your death messages will be sent.`
				};

				await sendToken(msg);
			}
		} else {
			if (user.confirmationCounter > 0) {
				user.confirmationCounter--;

				if (user.confirmationCounter === 0) {
					const messages = await Message.find({ userId: user._id });

					for (const message of messages) {
						const decryptedText = decrypt(message.text);

						const msg = {
							mailTo: message.to,
							mailSubject: message.subject,
							mailText: decryptedText
						};

						await sendMessage(msg);
					}

					user.isAlive = false;
				}
			}
		}
		await user.save();
	}
}
