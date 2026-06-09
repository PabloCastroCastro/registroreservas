import { execFile } from 'child_process';
import { promisify } from 'util';
import sharp from 'sharp';
import { parse } from 'mrz';
import fs from 'fs';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);

function mrzDateToISO(yymmdd, expiryDate = false) {
    if (!yymmdd || yymmdd.length !== 6) return null;
    const yy = parseInt(yymmdd.slice(0, 2));
    const mm = yymmdd.slice(2, 4);
    const dd = yymmdd.slice(4, 6);
    // Para caducidades: umbral 70 (ningún DNI vigente caduca en el siglo XX).
    // Para nacimientos: umbral 30 (cubre nacidos hasta 2030).
    const year = yy < (expiryDate ? 70 : 31) ? 2000 + yy : 1900 + yy;
    return `${year}-${mm}-${dd}`;
}

const LETTER_TO_DIGIT = { O: '0', D: '0', I: '1', L: '1', B: '8', S: '5', Z: '2', G: '6' };

function correctDateWithCheckDigit(dateStr, checkDigitChar) {
    if (!checkDigitChar || !/\d/.test(checkDigitChar)) return null;
    if (!dateStr || dateStr.length !== 6) return null;
    const normalized = dateStr.split('').map(c => LETTER_TO_DIGIT[c] ?? c).join('');
    if (!/^\d{6}$/.test(normalized)) return null;
    const check = parseInt(checkDigitChar);
    const weights = [7, 3, 1, 7, 3, 1];
    const calcCheck = s => s.split('').reduce((acc, c, i) => acc + parseInt(c) * weights[i], 0) % 10;
    if (calcCheck(normalized) === check) return normalized;
    for (let pos = 0; pos < 6; pos++) {
        for (let d = 0; d <= 9; d++) {
            if (d === parseInt(normalized[pos])) continue;
            const trial = normalized.slice(0, pos) + d + normalized.slice(pos + 1);
            if (calcCheck(trial) === check) return trial;
        }
    }
    return null;
}

function textDateToISO(text) {
    const match = text.match(/(\d{1,2})[\s./\-](\d{1,2})[\s./\-](\d{4})/);
    if (!match) return null;
    const [, dd, mm, yyyy] = match;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

async function runOCR(imagePath, { whitelist = null, lang = 'spa' } = {}) {
    const args = [imagePath, 'stdout', '-l', lang, '--oem', '1', '--psm', '6'];
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

function accumulateCandidates(state, candidates) {
    for (const c of candidates) {
        // Línea 1: contiene "IDESP"
        const idIdx = c.indexOf('IDESP');
        if (idIdx !== -1 && !state.line1) {
            state.line1 = c.slice(idIdx, idIdx + 30).padEnd(30, '<');
            continue;
        }
        // Línea 1 fallback: número DNI (8 dígitos + letra) con padding '<', alinear a posición 15
        if (!state.line1 && /\d{8}[A-Z]/.test(c) && /[<]{4,}/.test(c)) {
            const m = c.match(/(\d{8}[A-Z])/);
            const dniIdx = c.indexOf(m[1]);
            const prefix = '<'.repeat(Math.max(0, 15 - dniIdx));
            state.line1 = (prefix + c).slice(0, 30).padEnd(30, '<');
            continue;
        }

        // Línea 3 (nombres): gana el candidato con menos prefijo de ruido antes del patrón válido.
        // No "primer resultado gana" — la imagen completa puede ser más limpia que el crop.
        if (/[A-Z]{2,}<<[A-Z]/.test(c)) {
            const m = c.match(/(?:[A-Z]+<)*[A-Z]+<<[A-Z]/);
            const start = m ? m.index : Math.max(0, c.search(/[A-Z]/));
            if (start < state.line3Start) {
                state.line3 = c.slice(start, start + 30).padEnd(30, '<');
                state.line3Start = start;
            }
            continue;
        }

        // Línea 2 primaria: patrón completo fecha+check+sexo+fecha
        // IMPORTANTE: buscar desde donde empieza el match, no desde posición 0,
        // para evitar incluir chars de ruido previos al inicio real de la línea.
        if (/\d{6}[0-9<][MF<]\d{6}/.test(c)) {
            const m = c.match(/\d{6}[0-9<][MF<]\d{6}/);
            const startIdx = m.index;
            const base = c.slice(startIdx, startIdx + 30).padEnd(30, '<');
            if (!state.line2Options.includes(base)) state.line2Options.push(base);
            if (c.length > startIdx + 30 && /\d/.test(c[startIdx + 30])) {
                const variant = base.slice(0, 29) + c[startIdx + 30];
                if (!state.line2Options.includes(variant)) state.line2Options.push(variant);
            }
            continue;
        }
        // Línea 2 fallback: sexo+caducidad+check+nacionalidad, alinear sexo a posición 7
        if (/[MF]\d{6}[0-9][A-Z]{3}/.test(c)) {
            const m = c.match(/([MF]\d{6}[0-9][A-Z]{3})/);
            const sexIdx = c.indexOf(m[1]);
            const prefix = '<'.repeat(Math.max(0, 7 - sexIdx));
            const aligned = prefix + c;
            const base = aligned.slice(0, 30).padEnd(30, '<');
            if (!state.line2Options.includes(base)) state.line2Options.push(base);
            if (aligned.length > 30 && /\d/.test(aligned[30])) {
                const variant = base.slice(0, 29) + aligned[30];
                if (!state.line2Options.includes(variant)) state.line2Options.push(variant);
            }
        }
    }
}

function fixSupportNumber(s) {
    const firstDigit = s.search(/\d/);
    if (firstDigit < 0) return s;
    const digits = s.slice(firstDigit).split('').map(c => LETTER_TO_DIGIT[c] ?? c).join('');
    return s.slice(0, firstDigit) + digits;
}

async function preprocessImage(inputBuffer, rotate180 = false) {
    let pipeline = sharp(inputBuffer)
        .rotate()
        .greyscale()
        .normalize()
        .sharpen()
        .resize({ width: 1800, withoutEnlargement: false });
    if (rotate180) pipeline = pipeline.rotate(180);
    return pipeline.png().toBuffer();
}

export async function parseDNIFromImage(inputBuffer) {
    const ts = Date.now();
    const tmpFull    = path.join(os.tmpdir(), `dni_full_${ts}.png`);
    const tmpCrop    = path.join(os.tmpdir(), `dni_crop_${ts}.png`);
    const tmpFull180 = path.join(os.tmpdir(), `dni_full180_${ts}.png`);
    const tmpCrop180 = path.join(os.tmpdir(), `dni_crop180_${ts}.png`);
    const tmpFiles   = [tmpFull, tmpCrop, tmpFull180, tmpCrop180];

    try {
        const normalBuffer = await preprocessImage(inputBuffer, false);
        const normalMeta = await sharp(normalBuffer).metadata();
        await sharp(normalBuffer).png().toFile(tmpFull);
        const mrzHeight = Math.floor(normalMeta.height * 0.35);
        await sharp(normalBuffer)
            .extract({ left: 0, top: normalMeta.height - mrzHeight, width: normalMeta.width, height: mrzHeight })
            .png().toFile(tmpCrop);

        const flippedBuffer = await preprocessImage(inputBuffer, true);
        const flippedMeta = await sharp(flippedBuffer).metadata();
        await sharp(flippedBuffer).png().toFile(tmpFull180);
        const mrzHeight180 = Math.floor(flippedMeta.height * 0.35);
        await sharp(flippedBuffer)
            .extract({ left: 0, top: flippedMeta.height - mrzHeight180, width: flippedMeta.width, height: mrzHeight180 })
            .png().toFile(tmpCrop180);

        const state = { line1: null, line2Options: [], line3: null, line3Start: Infinity };
        let domicilioPath = tmpFull;

        for (const [cropPath, fullPath] of [[tmpCrop, tmpFull], [tmpCrop180, tmpFull180]]) {
            for (const imgPath of [cropPath, fullPath]) {
                const text = await runOCR(imgPath, { whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<', lang: 'ocrb' });
                console.log('[parseDNI] OCR output:', JSON.stringify(text));
                const lines = extractMrzLines(text);
                console.log('[parseDNI] MRZ candidates:', lines);
                accumulateCandidates(state, lines);
                if (imgPath === fullPath && state.line1) domicilioPath = fullPath;
            }
            if (state.line1 && state.line2Options.length > 0 && state.line3) break;
        }

        const { line1, line2Options, line3 } = state;
        if (!line1 || line2Options.length === 0 || !line3) {
            throw new Error(
                `No se identificaron las 3 líneas MRZ ` +
                `(línea1:${!!line1}, línea2:${line2Options.length > 0}, línea3:${!!line3}). ` +
                `Fotografía la cara trasera del DNI completa con buena iluminación.`
            );
        }

        let mrzLines = null;
        for (const line2 of line2Options) {
            try {
                const r = parse([line1, line2, line3]);
                if (r.valid) {
                    console.log('[parseDNI] MRZ válido con línea2:', JSON.stringify(line2));
                    mrzLines = [line1, line2, line3];
                    break;
                }
            } catch {}
        }
        if (!mrzLines) {
            console.warn('[parseDNI] No se encontró combinación con check digits correctos, usando primera opción');
            mrzLines = [line1, line2Options[0], line3];
        }

        console.log('[parseDNI] Parsing MRZ lines:', mrzLines);
        const result = parse(mrzLines);
        if (!result.valid) {
            console.warn('[parseDNI] MRZ con check digits incorrectos, usando campos disponibles de todas formas');
        }

        const f = result.fields;
        console.log('[parseDNI] result.fields raw:', JSON.stringify(f));

        const surnames = (f.lastName ?? '').split(' ').filter(Boolean);
        const documentNumber  = (f.optional1 ?? '').replace(/</g, '').trim();
        const supportDocument = fixSupportNumber((f.documentNumber ?? '').replace(/</g, '').trim());

        let birthDateRaw = f.birthDate;
        if (f.birthDateCheckDigit === null) {
            const corrected = correctDateWithCheckDigit(mrzLines[1].slice(0, 6), mrzLines[1][6]);
            if (corrected) {
                console.log('[parseDNI] Fecha nacimiento corregida:', mrzLines[1].slice(0, 6), '->', corrected);
                birthDateRaw = corrected;
            }
        }

        const domicilio = extractDomicilio(await runOCR(domicilioPath, { lang: 'spa' }));

        return {
            nombre: (f.firstName ?? '').replace(/</g, ' ').trim(),
            apellido1: surnames[0] ?? '',
            apellido2: surnames[1] ?? '',
            documentNumber,
            supportDocument,
            birthDate: mrzDateToISO(birthDateRaw),
            expirationDate: mrzDateToISO(f.expirationDate, true),
            sex: f.sex === 'male' ? 'M' : f.sex === 'female' ? 'F' : '',
            nationality: f.nationality ?? 'ESP',
            domicilio: domicilio.line ?? null,
            municipio: domicilio.municipio ?? null,
            provincia: domicilio.provincia ?? null,
        };
    } finally {
        tmpFiles.forEach(f => { try { fs.unlinkSync(f); } catch {} });
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

export async function parseExpeditionDate(inputBuffer) {
    const tmpFront    = path.join(os.tmpdir(), `dni_front_${Date.now()}.png`);
    const tmpFront180 = path.join(os.tmpdir(), `dni_front180_${Date.now()}.png`);

    try {
        for (const [rotate180, tmpPath] of [[false, tmpFront], [true, tmpFront180]]) {
            let pipeline = sharp(inputBuffer)
                .rotate()
                .greyscale().normalize().sharpen()
                .resize({ width: 1800, withoutEnlargement: false });
            if (rotate180) pipeline = pipeline.rotate(180);
            await pipeline.png().toFile(tmpPath);

            const text = await runOCR(tmpPath, { lang: 'spa' });
            console.log(`[parseDNI front${rotate180 ? ' 180°' : ''}] OCR output:`, JSON.stringify(text));

            const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            for (let i = 0; i < lines.length - 1; i++) {
                if (/EMISI/i.test(lines[i])) {
                    const date = textDateToISO(lines[i + 1]);
                    console.log(`[parseDNI front${rotate180 ? ' 180°' : ''}] Expedición encontrada:`, lines[i + 1], '→', date);
                    if (date) return date;
                }
            }
        }

        console.log('[parseDNI front] No se encontró fecha de expedición');
        return null;
    } finally {
        [tmpFront, tmpFront180].forEach(f => { try { fs.unlinkSync(f); } catch {} });
    }
}
