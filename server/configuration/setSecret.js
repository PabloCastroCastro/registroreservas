// Uso: node configuration/setSecret.js <clave> <valor>
//
// Actualiza en claro una clave de la configuración de secretos del backend.
// Ejecutar después CONFIG_MASTER_KEY=<clave> node configuration/encryptSecrets.js
// para volver a cifrarla.

import fs from 'fs';

const CONFIG_PATH = './configuration/password.json';
const [key, value] = process.argv.slice(2);

if (!key || value === undefined) {
    console.error('Uso: node configuration/setSecret.js <clave> <valor>');
    process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
config[key] = value;
fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 4) + '\n');

console.log(`Clave "${key}" actualizada.`);
