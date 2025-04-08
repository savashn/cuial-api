import { describe, beforeAll, afterAll, it, expect, jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../db/user';
import Message from '../db/message';
import deadMansSwitch from '../utils/deadMansSwitch';
import { sendMessage, sendToken } from '../utils/mail';
import { encrypt } from '../utils/crypto';
import { Resend } from 'resend';

let mongoServer: MongoMemoryServer;

jest.mock('../utils/mail', () => ({
	sendToken: jest.fn(),
	sendMessage: jest.fn()
}));

/* prettier-ignore */
describe.only('Dead Man\'s Switch', () => {
	beforeAll(async () => {
		mongoServer = await MongoMemoryServer.create();
		const uri = mongoServer.getUri();

		await mongoose.connect(uri);

		console.log('Connected to database');

		const user1 = await User.create({
			name: 'Test User 1',
			email: 'example1@example.com',
			password: 'testuserpassword',
			messages: 1,
			isVerified: true,
			notificationCounter: 1,
			confirmationCounter: 1
		});
		const user2 = await User.create({
			name: 'Test User 2',
			email: 'example2@example.com',
			password: 'testuserpassword',
			messages: 1,
			isVerified: true,
			notificationCounter: 0,
			confirmationCounter: 1
		});

		const text = encrypt('If you are reading this, I am no longer here.');

		await Message.create([
			{
				userId: user1._id,
				to: 'friend1@example.com',
				subject: 'Final Words',
				text: text
			},
			{
				userId: user2._id,
				to: 'friend2@example.com',
				subject: 'Final Words 2',
				text: text
			}
		]);

		console.log('User 1 and has been created');
		console.log('User 2 has been created');
		console.log('Messages has been created');
	});

	afterAll(async () => {
		await mongoose.connection.dropDatabase();
		await mongoose.connection.close();
		await mongoServer.stop();
		console.log('Connection has been closed');
	});

	it('Should process users and send emails correctly', async () => {
		const users = await User.find({ isVerified: true, messages: { $gt: 0 } });
		console.log('Users before the cron job:', users);

		await deadMansSwitch();

		expect(sendToken).toHaveBeenCalledTimes(1);
		expect(sendToken).toHaveReturnedTimes(1);

		expect(sendMessage).toHaveBeenCalledTimes(1);
		expect(sendMessage).toHaveReturnedTimes(1);

		const updatedUsers = await User.find({ isVerified: true, messages: { $gt: 0 } });

		console.log('Users after the cron job:', updatedUsers);

		for (const user of updatedUsers) {
			expect(user.notificationCounter).toBeGreaterThanOrEqual(0);
			expect(user.confirmationCounter).toBeGreaterThanOrEqual(0);
		}
	});
});

describe('Spam Test', () => {
	const resend = new Resend(process.env.RESEND_KEY);
	const year = new Date().getFullYear();

	it('Should send a test email to mail-tester', async () => {
		try {
			await resend.emails.send({
				from: 'CUIAL <noreply@cuial.com>',
				to: 'test-8bt84sh84@srv1.mail-tester.com', // NEED TO CHANGE THIS EVERYTIME
				subject: 'Goodbye, my dear friend',
				html: `
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Goodbye, my dear friend</title>
                            <style>
                                body {
                                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                    margin: 0;
                                    padding: 0;
                                    line-height: 1.5
                                }
                                .text {
                                    white-space: pre-wrap;
                                    word-wrap: break-word;
                                    overflow-wrap: break-word;
                                    margin: 10px 0;
                                    max-width: 100%;
                                    font-size: 14px;
                                    text-align: left;
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
                            </style>
                        </head>
                        <body>
                            <div class="text">
                                <p>Writing these words is harder than I expected. Sometimes, words just aren’t enough—especially when it comes to saying goodbye. But I want you to know this isn’t the end. It’s just a fork in the road, maybe even the beginning of something new.</p>
                                <p>When I think about the time we’ve spent together, I can’t help but smile. The laughter we shared, the secrets we told, the hard days we got through side by side—they’ve all carved a permanent place in my heart. I’ll always be grateful that life brought someone like you into my world.</p>
                                <p>Our paths may be heading in different directions now, but I don’t believe that means our friendship has to fade. Even if miles separate us, I’ll always be here. A text or a call away whenever you need.</p>
                                <p>I wish you nothing but the best on this new journey. I hope you find kind people, exciting adventures, and moments that make your heart race. You truly deserve all the good things life has to offer.</p>
                                <p>Take good care of yourself. And don’t forget to look up at the sky every now and then… we might be looking at it at the same time.</p>
                                <p>With love,</p>
                                <p>John Doe</p>
                            </div>
                            <br><br><hr><br>
                            <div class="footer">
                                <p>&copy; ${year} CUIAL - All rights reserved.</p>
                                <p class="note">This is an automated message from CUIAL app. Get in touch with us anytime by clicking <a href='https://cuial.com/contact' target="_blank" style="color: #555;">here.</a></p>
                            </div>
                        </body>
                        </html>
                    `
			});
		} catch (err) {
			console.log(err);
		}
	});
});
