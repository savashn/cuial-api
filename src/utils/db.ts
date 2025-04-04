import mongoose from 'mongoose';

const db = async (): Promise<void> => {
	try {
		await mongoose.connect(process.env.DB_URI as string, {
			autoIndex: false,
			maxPoolSize: 10
		});
	} catch (err) {
		console.log(err);
		throw err;
	}
};

export default db;
