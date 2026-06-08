import { execFile } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
import { parse } from 'mrz';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);

function mrzDateToISO(yymmdd) {
    if (!yymmdd || yymmdd.length !== 6) return null;
    const yy = parseInt(yymmdd.slice(0, 2));
    const mm = yymmdd.slice(2, 4);
    const dd = yymmdd.slice(4, 6);
    const year = yy <= 30 ? 2000 + yy : 1900 + yy;
    return `${year}-${mm}-${dd}`;
}

function textDateToISO(text) {
    // Acepta formatos: "12 03 2020", "12.03.2020", "12/03/2020", "12-03-2020"
    const match = text.match(/(\d{1,2})[\s./\-](\d{1,2})[\s./\-](\d{4})/);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

async function runOCR(imagePath, whitelist = null) {
    const args = [imagePath, 'stdout', '-l', 'spa', '--oem', '1', '--psm', '6'];
    if (whitelist) args.push('-c', `tessedit_char_whitelist=${whitelist}`);
    const { stdout } = await execFileAsync('tesseract', args);
    return stdout;
}

function extractMrzLines(text) {
    return text
        .toUpperCase()
        .split('\n')
        .map(l => l.replace(/\s/g, '').replace(/[^A-Z0-9<]/g, ''))
        .filter(l => l.length >= 20);
}

// Cara trasera: extrae datos del MRZ
export async function parseDNIFromImage(inputBuffer) {
    const tmpFull = path.join(os.tmpdir(), `dni_full_${Date.now()}.png`);
    const tmpCrop = path.join(os.tmpdir(), `dni_crop_${Date.now()}.png`);

    try {
        const metadata = await sharp(inputBuffer).metadata();

        await sharp(inputBuffer)
            .greyscale().normalize().sharpen()
            .resize({ width: 1800, withoutEnlargement: false })
            .png().toFile(tmpFull);

        const mrzHeight = Math.floor(metadata.height * 0.35);
        const mrzTop = metadata.height - mrzHeight;
        await sharp(inputBuffer)
            .extract({ left: 0, top: mrzTop, width: metadata.width, height: mrzHeight })
            .greyscale().normalize().sharpen()
            .resize({ width: 1800, withoutEnlargement: false })
            .png().toFile(tmpCrop);

        let lines = [];
        for (const imgPath of [tmpCrop, tmpFull]) {
            const text = await runOCR(imgPath, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<');
            console.log('[parseDNI] OCR output:', JSON.stringify(text));
            lines = extractMrzLines(text);
            console.log('[parseDNI] MRZ candidates:', lines);
            if (lines.length >= 3) break;
        }

        if (lines.length < 3) {
            throw new Error(`No se detectaron las 3 líneas MRZ (encontradas: ${lines.length}). Fotografía la cara trasera del DNI completa con buena iluminación.`);
        }

        const mrzLines = lines.slice(-3).map(l => l.slice(0, 30).padEnd(30, '<'));
        console.log('[parseDNI] Parsing MRZ lines:', mrzLines);
        const result = parse(mrzLines);

        if (!result.valid) {
            throw new Error('MRZ no válido. Comprueba que la imagen sea nítida y el DNI esté encuadrado correctamente.');
        }

        const f = result.fields;
        const surnames = (f.lastName ?? '').split('<').filter(Boolean);

        // Intentar extraer domicilio del texto OCR completo (encima del MRZ)
        const domicilio = extractDomicilio(await runOCR(tmpFull));

        return {
            nombre: (f.firstName ?? '').replace(/</g, ' ').trim(),
            apellido1: surnames[0] ?? '',
            apellido2: surnames[1] ?? '',
            documentNumber: f.documentNumber ?? '',
            supportDocument: (f.optionalData1 ?? '').replace(/</g, '').trim(),
            birthDate: mrzDateToISO(f.birthDate),
            expirationDate: mrzDateToISO(f.expirationDate),
            sex: f.sex === 'M' ? 'M' : f.sex === 'F' ? 'F' : '',
            nationality: f.nationality ?? 'ESP',
            domicilio: domicilio.line ?? null,
            municipio: domicilio.municipio ?? null,
            provincia: domicilio.provincia ?? null,
        };
    } finally {
        [tmpFull, tmpCrop].forEach(f => { try { fs.unlinkSync(f); } catch {} });
    }
}

function extractDomicilio(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    for (let i = 0; i < lines.length - 1; i++) {
        if (/DOMICILIO/i.test(lines[i])) {
            return {
                line: lines[i + 1] ?? null,
                municipio: lines[i + 2] ?? null,
                provincia: lines[i + 3] ?? null,
            };
        }
    }
    return {};
}

// Cara delantera: extrae fecha de expedición buscando la línea bajo "EMISI"
export async function parseExpeditionDate(inputBuffer) {
    const tmpFront = path.join(os.tmpdir(), `dni_front_${Date.now()}.png`);

    try {
        await sharp(inputBuffer)
            .greyscale().normalize().sharpen()
            .resize({ width: 1800, withoutEnlargement: false })
            .png().toFile(tmpFront);

        const text = await runOCR(tmpFront);
        console.log('[parseDNI front] OCR output:', JSON.stringify(text));

        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

        for (let i = 0; i < lines.length - 1; i++) {
            if (/EMISI/i.test(lines[i])) {
                const date = textDateToISO(lines[i + 1]);
                console.log('[parseDNI front] Expedición encontrada:', lines[i + 1], '→', date);
                if (date) return date;
            }
        }

        console.log('[parseDNI front] No se encontró fecha de expedición');
        return null;
    } finally {
        try { fs.unlinkSync(tmpFront); } catch {}
    }
}
