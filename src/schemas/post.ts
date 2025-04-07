import { z } from 'zod';

export const registerSchema = z.object({
	name: z.string().min(2, 'Name is required'),
	email: z.string().email('Invalid email format').min(5, 'Email is required'),
	password: z.string().min(8, 'Password must be at least 8 characters')
});

export const loginSchema = z.object({
	email: z.string().email('Invalid email format').min(5, 'Email is required'),
	password: z.string().min(6, 'Password is required')
});

export const messageSchema = z.object({
	to: z.string().email('Invalid email format').min(5, 'Email is required'),
	subject: z
		.string()
		.min(2, 'Subject is required')
		.max(60, 'Subject cannot be longer than 60 characters'),
	text: z.string().min(2, 'Text is required'),
	sendInfo: z.boolean().default(false),
	sendPreview: z.boolean().default(false)
});

export const contactSchema = z.object({
	email: z.string().email('Invalid email format').nullable().optional(),
	name: z.string().min(1, 'The name field must be filled'),
	message: z.string().min(1, 'The message field must be filled')
});
