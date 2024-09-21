import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { config } from 'src/backend/config/config';

// Encryption key derived from the configuration
const ENCRYPTION_KEY: Buffer = crypto.scryptSync(config.encryption.secret, 'salt', 32);

// Length of the initialization vector for AES encryption
const IV_LENGTH: number = 16;

/**
 * Hashes a password using bcrypt
 * @param password The plain-text password to hash
 * @returns A promise resolving to the hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plain-text password with a hashed password
 * @param plainPassword The plain-text password to compare
 * @param hashedPassword The hashed password to compare against
 * @returns A promise resolving to true if passwords match, false otherwise
 */
export async function comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Encrypts data using AES-256-CBC
 * @param data The string data to encrypt
 * @returns The encrypted data as a base64 string
 */
export function encryptData(data: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;
}

/**
 * Decrypts data that was encrypted using encryptData
 * @param encryptedData The encrypted data as a base64 string
 * @returns The decrypted data as a string
 */
export function decryptData(encryptedData: string): string {
  const [ivString, encryptedText] = encryptedData.split(':');
  const iv = Buffer.from(ivString, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}