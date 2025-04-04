import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface DecodedToken {
	id: string;
	name: string;
}

declare module 'express-serve-static-core' {
	interface Request {
		user?: {
			id: string;
			name: string;
		};
	}
}

export async function auth(req: Request, res: Response, next: NextFunction): Promise<void> {
	const token = req.header('x-auth-token');

	if (!token) {
		res.status(401).send('User is not allowed');
		return;
	}

	try {
		const decodedToken = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
		req.user = decodedToken;
		next();
	} catch (err) {
		console.log(err);
		res.status(400).send('Broken token');
	}
}
