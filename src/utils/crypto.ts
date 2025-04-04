import crypto from 'crypto';
import Token from '../db/token';

const PASSPHRASE = process.env.ENCRYPTION_SECRET as string;

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;

function deriveKey(salt: Buffer): Buffer {
	return crypto.pbkdf2Sync(PASSPHRASE, salt, 100_000, KEY_LENGTH, 'sha512');
}

export function encrypt(text: string): string {
	const iv = crypto.randomBytes(IV_LENGTH);
	const salt = crypto.randomBytes(SALT_LENGTH);
	const key = deriveKey(salt);

	const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
	const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();

	// Salt + IV + Tag + Encrypted format
	return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

export function decrypt(encryptedData: string): string {
	const bData = Buffer.from(encryptedData, 'base64');

	const salt = bData.slice(0, SALT_LENGTH);
	const iv = bData.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
	const tag = bData.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + 16);
	const encrypted = bData.slice(SALT_LENGTH + IV_LENGTH + 16);

	const key = deriveKey(salt);
	const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
	decipher.setAuthTag(tag);

	const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
	return decrypted.toString('utf8');
}

export async function generateToken(email: string): Promise<string> {
	const token = crypto.randomBytes(32).toString('hex');

	await Token.findOneAndDelete({ email });
	await Token.create({ email, token });

	return token;
}
