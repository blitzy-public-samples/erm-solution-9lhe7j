import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { hashPassword, comparePassword, encryptData, decryptData } from 'src/backend/utils/encryption';
import config from 'src/backend/config/config';

const testPassword = "testPassword123!";
const testData = "This is a test string for encryption and decryption.";

describe('Encryption Utils', () => {
  it('should hash a password correctly', async () => {
    const hashedPassword = await hashPassword(testPassword);
    expect(typeof hashedPassword).toBe('string');
    expect(hashedPassword).not.toEqual(testPassword);
    const isMatch = await bcrypt.compare(testPassword, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it('should compare a password with its hash correctly', async () => {
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    const isMatch = await comparePassword(testPassword, hashedPassword);
    expect(isMatch).toBe(true);
    const isNotMatch = await comparePassword('wrongPassword', hashedPassword);
    expect(isNotMatch).toBe(false);
  });

  it('should encrypt and decrypt data correctly', () => {
    const encryptedData = encryptData(testData);
    expect(encryptedData).not.toEqual(testData);
    const decryptedData = decryptData(encryptedData);
    expect(decryptedData).toEqual(testData);
  });

  it('should throw an error when decrypting with an incorrect key', () => {
    const encryptedData = encryptData(testData);
    const originalKey = config.encryption.key;
    config.encryption.key = 'incorrectKey';
    expect(() => decryptData(encryptedData)).toThrow();
    config.encryption.key = originalKey;
  });

  it('should generate different hashes for the same password', async () => {
    const hash1 = await hashPassword(testPassword);
    const hash2 = await hashPassword(testPassword);
    expect(hash1).not.toEqual(hash2);
  });

  // Additional edge case tests
  it('should handle empty strings for password hashing', async () => {
    const hashedEmpty = await hashPassword('');
    expect(typeof hashedEmpty).toBe('string');
    expect(hashedEmpty).not.toEqual('');
  });

  it('should handle very long passwords', async () => {
    const longPassword = 'a'.repeat(1000);
    const hashedLong = await hashPassword(longPassword);
    expect(typeof hashedLong).toBe('string');
    const isMatch = await comparePassword(longPassword, hashedLong);
    expect(isMatch).toBe(true);
  });

  it('should handle special characters in passwords and data', async () => {
    const specialPassword = '!@#$%^&*()_+{}[]|":;<>?,./';
    const hashedSpecial = await hashPassword(specialPassword);
    const isMatch = await comparePassword(specialPassword, hashedSpecial);
    expect(isMatch).toBe(true);

    const specialData = '!@#$%^&*()_+{}[]|":;<>?,./';
    const encryptedSpecial = encryptData(specialData);
    const decryptedSpecial = decryptData(encryptedSpecial);
    expect(decryptedSpecial).toEqual(specialData);
  });

  // Performance test
  it('should complete hashing and encryption operations within acceptable time limits', async () => {
    const startHash = Date.now();
    await hashPassword(testPassword);
    const hashTime = Date.now() - startHash;
    expect(hashTime).toBeLessThan(1000); // Assuming 1 second is acceptable

    const startEncrypt = Date.now();
    encryptData(testData);
    const encryptTime = Date.now() - startEncrypt;
    expect(encryptTime).toBeLessThan(100); // Assuming 100ms is acceptable
  });

  // Encryption security tests
  it('should use a secure algorithm and key size for encryption', () => {
    const encryptedData = encryptData(testData);
    const [iv, encrypted] = encryptedData.split(':');
    expect(iv.length).toBe(32); // 16 bytes in hex
    expect(encrypted.length % 32).toBe(0); // AES block size is 16 bytes
  });

  it('should ensure encrypted data size is within expected bounds', () => {
    const encryptedData = encryptData(testData);
    expect(encryptedData.length).toBeLessThan(testData.length * 2 + 64); // Rough estimate
  });

  it('should fail decryption with tampered ciphertext', () => {
    const encryptedData = encryptData(testData);
    const tamperedData = encryptedData.slice(0, -1) + 'X'; // Change last character
    expect(() => decryptData(tamperedData)).toThrow();
  });
});