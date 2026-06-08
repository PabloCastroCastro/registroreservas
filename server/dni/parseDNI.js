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

async function runOCR(imagePath) {
    const { stdout } = await execFileAsync('tesseract', [
        imagePath, 'stdout',
        '-l', 'eng',
        '--oem', '1',
        '--psm', '6',
        '-c', 'tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
    ]);
    return stdout;
}

function extractMrzLines(text) {
    return text
        .toUpperCase()
        .split('\n')
        .map(l => l.replace(/\s/g, '').replace(/[^A-Z0-9<]/g, ''))
        .filter(l => l.length >= 20);
}

export async function parseDNIFromImage(inputBuffer) {
    const tmpFull = path.join(os.tmpdir(), `dni_full_${Date.now()}.png`);
    const tmpCrop = path.join(os.tmpdir(), `dni_crop_${Date.now()}.png`);

    try {
        const metadata = await sharp(inputBuffer).metadata();

        // Imagen completa preprocesada
        await sharp(inputBuffer)
            .greyscale()
            .normalize()
            .sharpen()
            .resize({ width: 1800, withoutEnlargement: false })
            .png()
            .toFile(tmpFull);

        // Recorte del 35% inferior (zona MRZ)
        const mrzHeight = Math.floor(metadata.height * 0.35);
        const mrzTop = metadata.height - mrzHeight;
        await sharp(inputBuffer)
            .extract({ left: 0, top: mrzTop, width: metadata.width, height: mrzHeight })
            .greyscale()
            .normalize()
            .sharpen()
            .resize({ width: 1800, withoutEnlargement: false })
            .png()
            .toFile(tmpCrop);

        // Intentar primero con el recorte, luego con imagen completa
        let lines = [];
        for (const imgPath of [tmpCrop, tmpFull]) {
            const text = await runOCR(imgPath);
            console.log('[parseDNI] OCR output:', JSON.stringify(text));
            lines = extractMrzLines(text);
            console.log('[parseDNI] MRZ candidates:', lines);
            if (lines.length >= 3) break;
        }

        if (lines.length < 3) {
            throw new Error(`No se detectaron las 3 líneas MRZ (encontradas: ${lines.length}). Asegúrate de fotografiar el DNI completo con buena iluminación y encuadrado.`);
        }

        const mrzLines = lines.slice(-3).map(l => l.slice(0, 30).padEnd(30, '<'));
        console.log('[parseDNI] Parsing MRZ lines:', mrzLines);
        const result = parse(mrzLines);

        if (!result.valid) {
            throw new Error('MRZ no válido. Comprueba que la imagen sea nítida y el DNI esté encuadrado correctamente.');
        }

        const f = result.fields;
        const surnames = (f.lastName ?? '').split('<').filter(Boolean);

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
        };
    } finally {
        [tmpFull, tmpCrop].forEach(f => { try { fs.unlinkSync(f); } catch {} });
    }
}
