import { ErrorRequestHandler } from 'express';
import { z } from 'zod';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
	if (res.headersSent) {
		next(err);
		return;
	}

	if (err instanceof z.ZodError) {
		res.status(400).json({
			success: false,
			message: 'Validation failed',
			errors: err.errors
		});
		return;
	}

	console.error('Error:', err);
	res.status(500).json({ success: false, message: 'Internal Server Error' });
};

export default errorHandler;
