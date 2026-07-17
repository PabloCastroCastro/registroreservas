import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { PDFParse } from 'pdf-parse';

const execFileAsync = promisify(execFile);

const MIN_NATIVE_TEXT_LENGTH = 30;

function tmpName(prefix, extension) {
    return path.join(os.tmpdir(), `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}${extension}`);
}

async function extractNativePdfText(buffer) {
    const parser = new PDFParse({ data: buffer });
    try {
        const result = await parser.getText();
        return (result.text ?? '').trim();
    } finally {
        await parser.destroy();
    }
}

async function ocrImageFile(imagePath) {
    const { stdout } = await execFileAsync('tesseract', [imagePath, 'stdout', '-l', 'spa', '--oem', '1', '--psm', '6']);
    return stdout;
}

async function ocrScannedPdf(buffer) {
    const tmpPdf = tmpName('invoice', '.pdf');
    const pagePrefix = tmpName('invoice_page', '');
    const tmpFiles = [tmpPdf];
    try {
        fs.writeFileSync(tmpPdf, buffer);
        await execFileAsync('pdftoppm', ['-png', '-r', '200', tmpPdf, pagePrefix]);

        const dir = path.dirname(pagePrefix);
        const prefixName = path.basename(pagePrefix);
        const pages = fs.readdirSync(dir)
            .filter(f => f.startsWith(prefixName))
            .sort()
            .map(f => path.join(dir, f));
        tmpFiles.push(...pages);

        let text = '';
        for (const page of pages) {
            text += (await ocrImageFile(page)) + '\n';
        }
        return text.trim();
    } finally {
        tmpFiles.forEach(f => { try { fs.unlinkSync(f); } catch { /* ya no existe */ } });
    }
}

async function ocrImageAttachment(buffer, extension) {
    const tmpImage = tmpName('invoice', `.${extension || 'png'}`);
    try {
        fs.writeFileSync(tmpImage, buffer);
        return (await ocrImageFile(tmpImage)).trim();
    } finally {
        try { fs.unlinkSync(tmpImage); } catch { /* ya no existe */ }
    }
}

async function getAttachmentText(buffer, contentType, filename) {
    const isPdf = (contentType ?? '').toLowerCase() === 'application/pdf' || (filename ?? '').toLowerCase().endsWith('.pdf');
    if (isPdf) {
        try {
            const text = await extractNativePdfText(buffer);
            if (text.length >= MIN_NATIVE_TEXT_LENGTH) return text;
        } catch (err) {
            console.error('Error extrayendo texto nativo del PDF:', err);
        }
        // PDF sin texto embebido (escaneado): OCR pagina a pagina.
        return ocrScannedPdf(buffer);
    }
    const extension = filename?.split('.').pop()?.toLowerCase();
    return ocrImageAttachment(buffer, extension);
}

function parseSpanishNumber(str) {
    if (!str) return null;
    const cleaned = str.replace(/[^\d.,-]/g, '');
    if (!cleaned) return null;
    // Formato español: punto de miles, coma decimal (p.ej. "1.234,56").
    const normalized = cleaned.includes(',') ? cleaned.replace(/\./g, '').replace(',', '.') : cleaned;
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
}

function extractField(text, pattern) {
    if (!pattern) return null;
    try {
        const match = new RegExp(pattern, 'i').exec(text);
        if (!match) return null;
        return (match[1] ?? match[0]).trim();
    } catch (err) {
        console.error(`Patrón de extracción de factura inválido "${pattern}":`, err.message);
        return null;
    }
}

function cleanNif(str) {
    if (!str) return null;
    const cleaned = str.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    return cleaned || null;
}

function normalizeSpanishDate(str) {
    if (!str) return null;
    const match = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(str.trim());
    if (!match) return null;
    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function applyInvoiceTemplate(text, template) {
    return {
        invoiceNumber: extractField(text, template.invoiceNumberPattern),
        nif: cleanNif(extractField(text, template.nifPattern)),
        baseAmount: parseSpanishNumber(extractField(text, template.baseAmountPattern)),
        vatRatePercent: parseSpanishNumber(extractField(text, template.vatRatePattern)),
        totalAmount: parseSpanishNumber(extractField(text, template.totalAmountPattern)),
        date: normalizeSpanishDate(extractField(text, template.datePattern)),
    };
}

const EMPTY_RESULT = { invoiceNumber: null, nif: null, baseAmount: null, vatRatePercent: null, totalAmount: null, date: null };

export async function extractSupplierInvoiceFields(buffer, contentType, filename, template) {
    try {
        const text = await getAttachmentText(buffer, contentType, filename);
        return applyInvoiceTemplate(text, template ?? {});
    } catch (err) {
        console.error('Error extrayendo datos de factura de proveedor:', err);
        return EMPTY_RESULT;
    }
}
