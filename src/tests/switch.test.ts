import { describe, beforeAll, afterAll, it, expect, jest } from '@jest/globals';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../db/user';
import Message from '../db/message';
import deadMansSwitch from '../utils/deadMansSwitch';
import { sendMessage, sendToken } from '../utils/mail';

let mongoServer: MongoMemoryServer;

jest.mock('../utils/mail', () => ({
	sendToken: jest.fn(),
	sendMessage: jest.fn()
}));

describe('Dead Man\'s Switch', () => {
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

		await Message.create([
			{
				userId: user1._id,
				title: 'Goodbye Message',
				to: 'friend1@example.com',
				subject: 'Final Words',
				text: 'If you are reading this, I am no longer here.'
			},
			{
				userId: user2._id,
				title: 'Goodbye Message 2',
				to: 'friend2@example.com',
				subject: 'Final Words 2',
				text: 'If you are reading this, I am no longer here.'
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
