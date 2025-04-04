/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import mongoose from 'mongoose';
import deadMansSwitch from '../src/utils/deadMansSwitch';

export default async function handler(req, res) {
	try {
		await mongoose.connect(process.env.DB_URI, {
			autoIndex: false,
			maxPoolSize: 10
		});

		await deadMansSwitch();

		await mongoose.connection
			.close()
			.then(() => console.log('MongoDB connection is closed'))
			.catch((error) => console.error('Error closing MongoDB connection:', error));

		res.status(200).end('Cron job is done');
	} catch (err) {
		console.log(err);

		await mongoose.connection
			.close()
			.then(() => console.log('MongoDB connection is closed'))
			.catch((error) => console.error('Error closing MongoDB connection:', error));

		res.status(500).end('Cron job is failed');
	}

	res.status(200).end('Hello Cron!');
}
