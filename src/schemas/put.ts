import { z } from 'zod';

export const password = z.object({
	oldPassword: z.string().min(8, 'Old password must be at least 8 characters'),
	newPassword: z.string().min(8, 'New password must be at least 8 characters')
});

export const putMessageSchema = z.object({
	id: z.string(),
	to: z.string().email('Invalid email format').min(5, 'Email is required'),
	subject: z
		.string()
		.min(2, 'Subject is required')
		.max(60, 'Subject cannot be longer than 60 characters'),
	text: z.string().min(2, 'Text is required'),
	sendPreview: z.boolean().default(false)
});

export const putUserSchema = z.object({
	name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
	email: z.string().email('Invalid email format'),
	notification: z.number().int().min(1, 'Must be at least 1 day'),
	confirmation: z.number().int().min(1, 'Must be at least 1')
});

export const forgotPasswordSchema = z.object({
	token: z.string(),
	password: z.string()
});
