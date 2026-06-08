import tesseract from 'node-tesseract-ocr';
import sharp from 'sharp';
import { parse } from 'mrz';
import fs from 'fs';
import path from 'path';
import os from 'os';

function mrzDateToISO(yymmdd) {
    if (!yymmdd || yymmdd.length !== 6) return null;
    const yy = parseInt(yymmdd.slice(0, 2));
    const mm = yymmdd.slice(2, 4);
    const dd = yymmdd.slice(4, 6);
    const year = yy <= 30 ? 2000 + yy : 1900 + yy;
    return `${year}-${mm}-${dd}`;
}

export async function parseDNIFromImage(inputBuffer) {
    const tmpProcessed = path.join(os.tmpdir(), `dni_${Date.now()}.png`);

    try {
        const metadata = await sharp(inputBuffer).metadata();

        // Recortar la zona MRZ (25% inferior del documento)
        const mrzHeight = Math.floor(metadata.height * 0.28);
        const mrzTop = metadata.height - mrzHeight;

        await sharp(inputBuffer)
            .extract({ left: 0, top: mrzTop, width: metadata.width, height: mrzHeight })
            .greyscale()
            .normalize()
            .sharpen()
            .resize({ width: 1500, withoutEnlargement: false })
            .png()
            .toFile(tmpProcessed);

        const text = await tesseract.recognize(tmpProcessed, {
            lang: 'eng',
            oem: 1,
            psm: 6,
            tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
        });

        const lines = text
            .toUpperCase()
            .split('\n')
            .map(l => l.replace(/\s/g, '').replace(/[^A-Z0-9<]/g, ''))
            .filter(l => l.length >= 28);

        if (lines.length < 3) {
            throw new Error('No se detectaron las 3 líneas MRZ. Asegúrate de fotografiar el DNI completo con buena iluminación.');
        }

        const mrzLines = lines.slice(-3).map(l => l.slice(0, 30).padEnd(30, '<'));
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
        try { fs.unlinkSync(tmpProcessed); } catch {}
    }
}
