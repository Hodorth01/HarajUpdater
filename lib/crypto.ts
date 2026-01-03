import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Use the env variable, but provide a fallback so it doesn't return undefined
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a-very-secret-key-32-chars-long!!'; 
const IV_LENGTH = 16;

export function encrypt(text: string) {
    if (!text) throw new Error("No text provided for encryption");
    
    const iv = crypto.randomBytes(IV_LENGTH);
    // Ensure we use a Buffer for the key
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decrypt(hash: string) {
    const [iv, content] = hash.split(':');
    const decipher = crypto.createDecipheriv(
        ALGORITHM, 
        Buffer.from(ENCRYPTION_KEY), 
        Buffer.from(iv, 'hex')
    );
    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(content, 'hex')), 
        decipher.final()
    ]);
    return decrypted.toString();
}