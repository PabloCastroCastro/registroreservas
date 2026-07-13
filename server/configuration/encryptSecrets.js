// Uso: CONFIG_MASTER_KEY=<64 hex chars> node configuration/encryptSecrets.js
//
// Cifra en el sitio las claves sensibles (password/secretKey) de password.json.
// Genera antes password.json.bak con el contenido original.
// Genera una clave nueva con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

import fs from 'fs';
import { encryptValue, isEncrypted } from './secretsCrypto.js';

const CONFIG_PATH = './configuration/password.json';
const SENSITIVE_KEY_PATTERN = /password|secretKey/i;

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

const encryptedKeys = [];
for (const [key, value] of Object.entries(config)) {
    if (SENSITIVE_KEY_PATTERN.test(key) && typeof value === 'string' && value !== '' && !isEncrypted(value)) {
        config[key] = encryptValue(value);
        encryptedKeys.push(key);
    }
}

if (encryptedKeys.length === 0) {
    console.log('Nada que cifrar: no hay claves sensibles en texto plano.');
    process.exit(0);
}

fs.copyFileSync(CONFIG_PATH, CONFIG_PATH + '.bak');
fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4) + '\n');

console.log('Claves cifradas:', encryptedKeys.join(', '));
console.log('Copia de seguridad guardada en', CONFIG_PATH + '.bak');
