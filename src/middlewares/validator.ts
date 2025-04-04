import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

const validator = (schema: z.ZodTypeAny) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		const result = schema.safeParse(req.body);

		if (!result.success) {
			const err = result.error.errors.map((err) => ({
				field: err.path.join('.'),
				message: err.message
			}));

			res.status(400).json(err);
			return;
		}

		req.body = result.data;
		next();
	};
};

export default validator;
