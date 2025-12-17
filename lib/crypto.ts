import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

// Get encryption key from environment - REQUIRED in production
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY environment variable is not set. ' +
      'Please set a 32-character encryption key in your environment variables.'
    );
  }

  if (key.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must be exactly 32 characters long. Current length: ${key.length}`
    );
  }

  return Buffer.from(key);
}

export function encryptApiKey(apiKey: string): string {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Combine iv + authTag + encrypted data
    const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    return result;
  } catch (error) {
    // Don't log encryption errors to console
    throw new Error('Failed to encrypt API key');
  }
}

export function decryptApiKey(encryptedData: string): string {
  try {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    // Don't log decryption errors to console
    throw new Error('Failed to decrypt API key');
  }
}
