import { Resend } from 'resend';
import { generateToken } from './crypto';

const resend = new Resend(process.env.RESEND_KEY);

interface ISendMessage {
	mailTitle: string;
	mailTo: string;
	mailSubject: string;
	mailText: string;
}

interface ISendToken {
	email: string;
	type: string;
	query: string;
	mailSubject: string;
	mailText: string;
}

export async function sendMessage({
	mailTitle,
	mailTo,
	mailSubject,
	mailText
}: ISendMessage): Promise<void> {
	try {
		const data = await resend.emails.send({
			from: `${mailTitle} <noreply@cuial.com>`,
			to: [mailTo],
			subject: mailSubject,
			text: mailText
		});
		console.log(data);
	} catch (err) {
		console.log(err);
	}
}

export async function sendToken({
	email,
	type,
	query,
	mailSubject,
	mailText
}: ISendToken): Promise<void> {
	const token = await generateToken(email);
	const verificationLink = `https://cuial.com/${type}?${query}=${token}`;

	// type === 'renew-password' to re-generate password. Otherwise it's always going to be 'verify'

	await resend.emails.send({
		from: 'CUIAL <noreply@cuial.com>',
		to: email,
		subject: mailSubject,
		html: `<p><a href="${verificationLink}" target="_blank">Click here</a> ${mailText}</p>`
	});

	console.log(`The email has been sent to ${email} with token: ${token}`);
}
