import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENC_PREFIX = 'enc:';

const getMasterKey = () => {
    const keyHex = process.env.CONFIG_MASTER_KEY;
    if (!keyHex) {
        throw new Error('CONFIG_MASTER_KEY no está definida. Exporta una clave de 32 bytes en hexadecimal (64 caracteres) antes de arrancar el servidor.');
    }
    const key = Buffer.from(keyHex, 'hex');
    if (key.length !== 32) {
        throw new Error('CONFIG_MASTER_KEY debe ser una cadena hexadecimal de 64 caracteres (32 bytes).');
    }
    return key;
};

const isEncrypted = (value) => typeof value === 'string' && value.startsWith(ENC_PREFIX);

const encryptValue = (plainText) => {
    const key = getMasterKey();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return ENC_PREFIX + [iv, authTag, ciphertext].map(buf => buf.toString('hex')).join(':');
};

const decryptValue = (encoded) => {
    const key = getMasterKey();
    const [ivHex, authTagHex, cipherHex] = encoded.slice(ENC_PREFIX.length).split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const ciphertext = Buffer.from(cipherHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const plainText = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    return plainText.toString('utf8');
};

const resolveSecret = (value) => (isEncrypted(value) ? decryptValue(value) : value);

export { encryptValue, decryptValue, resolveSecret, isEncrypted };
