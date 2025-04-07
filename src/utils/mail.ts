import { Resend } from 'resend';
import { generateToken } from './crypto';

const resend = new Resend(process.env.RESEND_KEY);
const year = new Date().getFullYear();

interface ISendMessage {
	mailTo: string;
	mailSubject: string;
	mailText: string;
}

interface ISendInformation {
	mailTo: string;
	sender: string;
}

interface ISendToken {
	email: string;
	type: string;
	query: string;
	mailSubject: string;
	mailText: string;
}

export async function sendMessage({ mailTo, mailSubject, mailText }: ISendMessage): Promise<void> {
	try {
		await resend.emails.send({
			from: 'CUIAL <noreply@cuial.com>',
			to: [mailTo],
			subject: mailSubject,
			html: `
				<div style="white-space: pre-wrap; font-size: 14px; word-wrap: break-word; max-width: 100%; overflow-wrap: break-word; margin: 10px 0; text-align: left;">
				${mailText}
				</div>
			`
		});
	} catch (err) {
		console.log(err);
	}
}

export async function sendInformation({
	mailTo,
	sender
}: ISendInformation): Promise<void> {
	await resend.emails.send({
		from: 'CUIAL <noreply@cuial.com>',
		to: mailTo,
		subject: `${sender} left a death message to you`,
		html: `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${sender} left a death message to you</title>
				<style>
					body {
						font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
						margin: 0;
						padding: 0;
						background-color: #f9f9f9;
						color: #333;
					}
					.container {
						max-width: 600px;
						margin: 0 auto;
						background-color: #ffffff;
						border-radius: 8px;
						overflow: hidden;
						box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
					}
					.header {
						background: linear-gradient(to bottom, rgba(37, 49, 51, 1), rgba(255, 255, 255, 0));
						padding: 30px 20px;
						text-align: center;
					}
					.header-text {
						color: #ffffff;
						font-size: 24px;
						font-weight: bold;
						margin: 0;
					}
					.content {
						padding: 30px 25px;
						line-height: 1.6;
					}
					.footer {
						background-color: #f5f5f5;
						padding: 20px;
						text-align: center;
						color: #666;
						font-size: 14px;
					}
					.note {
						font-size: 13px;
						color: #888;
						margin-top: 15px;
					}
					@media screen and (max-width: 480px) {
						.container {
							width: 100%;
							border-radius: 0;
						}
						.content {
							padding: 20px 15px;
						}
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1 class="header-text" style="color: #ffffff;">CUIAL</h1>
					</div>
					
					<div class="content">
						<p>Hello,</p>
						<p>${sender} left a death message to you and wanted you to know about it. We will deliver it to your mailbox (${mailTo}) when he/she is gone.</p>
						
						<p>Sincerely,<br>The CUIAL App</p>
					</div>
					
					<div class="footer">
						<p>&copy; ${year} CUIAL - All rights reserved.</p>
						<p class="note">This email was sent to you automaticly by the CUIAL application. Please do not reply this email. Get in touch with us anytime by clicking <a href='https://cuial.com/contact' target="_blank" style="color: #555;">here.</a></p>
					</div>
				</div>
			</body>
			</html>
		`
	});
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
		html: `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>${mailSubject}</title>
				<style>
					body {
						font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
						margin: 0;
						padding: 0;
						background-color: #f9f9f9;
						color: #333;
					}
					.container {
						max-width: 600px;
						margin: 0 auto;
						background-color: #ffffff;
						border-radius: 8px;
						overflow: hidden;
						box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
					}
					.header {
						background: linear-gradient(to bottom, rgba(37, 49, 51, 1), rgba(255, 255, 255, 0));
						padding: 30px 20px;
						text-align: center;
					}
					.header-text {
						color: #ffffff;
						font-size: 24px;
						font-weight: bold;
						margin: 0;
					}
					.content {
						padding: 30px 25px;
						line-height: 1.6;
					}
					.button-container {
						text-align: center;
						margin: 25px 0;
					}
					.verification-button {
						display: inline-block;
						background-color: #253133;
						color: #ffffff;
						text-decoration: none;
						padding: 12px 30px;
						border-radius: 4px;
						font-weight: 500;
						font-size: 16px;
						transition: all 0.3s ease;
					}
					.verification-button:hover {
						background-color: #1e2729;
						transform: translateY(-2px);
					}
					.footer {
						background-color: #f5f5f5;
						padding: 20px;
						text-align: center;
						color: #666;
						font-size: 14px;
					}
					.note {
						font-size: 13px;
						color: #888;
						margin-top: 15px;
					}
					@media screen and (max-width: 480px) {
						.container {
							width: 100%;
							border-radius: 0;
						}
						.content {
							padding: 20px 15px;
						}
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1 class="header-text" style="color: #ffffff;">CUIAL</h1>
					</div>
					
					<div class="content">
						<p>Hello,</p>
						<p>${mailText}</p>
						
						<div class="button-container">
							<a href="${verificationLink}" class="verification-button" target="_blank">${mailSubject}</a>
						</div>
						
						<p>If you can't click the button, you can copy and paste the following link into your browser:</p>
						<p style="word-break: break-all; font-size: 14px; color: #555;">${verificationLink}</p>
						
						<p>Sincerely,<br>The CUIAL App</p>
					</div>
					
					<div class="footer">
						<p>&copy; ${year} CUIAL - All rights reserved.</p>
						<p class="note">This email was sent to you automaticly by the CUIAL application. Please do not reply this email. Get in touch with us anytime by clicking <a href='https://cuial.com/contact' target="_blank" style="color: #555;">here.</a></p>
					</div>
				</div>
			</body>
			</html>
		`
	});
}
