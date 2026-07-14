import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { adminGuard } from '../middleware/auth.js';
import readProperty from '../configuration/readConfiguration.js';
import {
    listSupplierInvoices,
    createSupplierInvoice,
    updateSupplierInvoice,
    deleteSupplierInvoice,
    getSupplierInvoiceFilePath,
    setSupplierInvoiceFilePath,
    listRegisteredEmailUids,
} from '../invoices/supplierInvoices.js';
import {
    checkPendingSupplierEmails,
    markSupplierEmailRead,
    downloadSupplierEmailAttachment,
} from '../mail/checkSupplierMails.js';
import { listSuppliers, getSupplierById } from '../suppliers/suppliers.js';
import { extractSupplierInvoiceFields } from '../invoices/extractSupplierInvoiceData.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
const FILES_DIR = './facturas-proveedor';

const EXTENSION_BY_CONTENT_TYPE = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};
const CONTENT_TYPE_BY_EXTENSION = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
};

function getImapCredentials() {
    const user = readProperty('mail.gmail.imap.user');
    const pass = readProperty('mail.gmail.imap.password');
    return (user && pass) ? { user, pass } : null;
}

function parseVatLines(raw) {
    if (!raw) return [];
    let parsed;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return [];
    }
    if (!Array.isArray(parsed)) return [];
    return parsed
        .map(l => ({ baseAmount: Number(l.baseAmount), vatRate: Number(l.vatRate) }))
        .filter(l => Number.isFinite(l.baseAmount) && Number.isFinite(l.vatRate));
}

function parseInvoiceBody(body) {
    const num = v => (v === undefined || v === null || v === '') ? null : Number(v);
    return {
        invoiceNumber: body.invoiceNumber || null,
        nif: body.nif || null,
        date: body.date,
        supplierName: body.supplierName,
        vatLines: parseVatLines(body.vatLines),
        totalAmount: num(body.totalAmount),
        reference: body.reference || null,
        notes: body.notes || null,
        emailUid: body.emailUid ? Number(body.emailUid) : null,
    };
}

function saveInvoiceFile(id, buffer, contentType, originalFilename) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
    const nameExtension = originalFilename?.split('.').pop()?.toLowerCase();
    const extension = CONTENT_TYPE_BY_EXTENSION[nameExtension]
        ? nameExtension
        : (EXTENSION_BY_CONTENT_TYPE[(contentType ?? '').toLowerCase()] ?? 'pdf');
    const filename = `${id}.${extension}`;
    fs.writeFileSync(path.join(FILES_DIR, filename), buffer);
    return filename;
}

function removeInvoiceFile(filePath) {
    try { fs.unlinkSync(path.join(FILES_DIR, filePath)); } catch { /* ya no existe */ }
}

router.get('/factura/proveedor/email-pending', async function (req, res) {
    if (!adminGuard(req, res)) return;

    try {
        const credentials = getImapCredentials();
        if (!credentials) return res.status(500).json({ error: 'Gmail IMAP no configurado' });
        const knownSuppliers = await listSuppliers();
        const excludeUids = await listRegisteredEmailUids();
        const pending = await checkPendingSupplierEmails(credentials.user, credentials.pass, knownSuppliers, excludeUids);
        res.json(pending);
    } catch (err) {
        console.error('Error leyendo correo de proveedores:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/factura/proveedor/email-pending/:uid/attachment', async function (req, res) {
    if (!adminGuard(req, res)) return;

    try {
        const credentials = getImapCredentials();
        if (!credentials) return res.status(500).json({ error: 'Gmail IMAP no configurado' });
        const attachment = await downloadSupplierEmailAttachment(credentials.user, credentials.pass, Number(req.params.uid));
        if (!attachment) return res.sendStatus(404);
        res.setHeader('Content-Type', attachment.contentType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${attachment.filename}"`);
        res.send(attachment.buffer);
    } catch (err) {
        console.error('Error obteniendo adjunto de correo de proveedor:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/factura/proveedor/email-pending/:uid/extract', async function (req, res) {
    if (!adminGuard(req, res)) return;

    const supplierId = Number(req.query.supplierId);
    if (!supplierId) return res.status(400).json({ error: 'supplierId es obligatorio' });

    try {
        const credentials = getImapCredentials();
        if (!credentials) return res.status(500).json({ error: 'Gmail IMAP no configurado' });
        const supplier = await getSupplierById(supplierId);
        if (!supplier) return res.sendStatus(404);

        const attachment = await downloadSupplierEmailAttachment(credentials.user, credentials.pass, Number(req.params.uid));
        if (!attachment) return res.sendStatus(404);

        const fields = await extractSupplierInvoiceFields(attachment.buffer, attachment.contentType, attachment.filename, supplier);
        res.json(fields);
    } catch (err) {
        console.error('Error extrayendo datos de factura de proveedor:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/factura/proveedor/:id/file', async function (req, res) {
    if (!adminGuard(req, res)) return;

    try {
        const filePath = await getSupplierInvoiceFilePath(req.params.id);
        if (!filePath) return res.sendStatus(404);
        const buffer = fs.readFileSync(path.join(FILES_DIR, filePath));
        const extension = filePath.split('.').pop().toLowerCase();
        res.setHeader('Content-Type', CONTENT_TYPE_BY_EXTENSION[extension] ?? 'application/octet-stream');
        res.setHeader('Content-Disposition', `inline; filename="${filePath}"`);
        res.send(buffer);
    } catch (err) {
        res.sendStatus(404);
    }
});

router.get('/factura/proveedor', async function (req, res) {
    if (!adminGuard(req, res)) return;

    try {
        const { year, quarter } = req.query;
        const invoices = await listSupplierInvoices(year, quarter);
        res.json(invoices);
    } catch (err) {
        console.error('Error listando facturas de proveedores:', err);
        res.sendStatus(500);
    }
});

router.post('/factura/proveedor', upload.single('file'), async function (req, res) {
    if (!adminGuard(req, res)) return;

    const invoice = parseInvoiceBody(req.body);
    if (!invoice.date || !invoice.supplierName || invoice.totalAmount == null) {
        return res.status(400).json({ message: 'date, supplierName y totalAmount son obligatorios' });
    }

    let id = null;
    try {
        id = await createSupplierInvoice(invoice);

        let attachment = req.file ? { buffer: req.file.buffer, contentType: req.file.mimetype, filename: req.file.originalname } : null;
        const credentials = getImapCredentials();
        if (!attachment && invoice.emailUid && credentials) {
            try {
                attachment = await downloadSupplierEmailAttachment(credentials.user, credentials.pass, invoice.emailUid);
            } catch (err) {
                console.error('Error descargando adjunto de proveedor:', err);
            }
        }
        if (attachment) {
            const filePath = saveInvoiceFile(id, attachment.buffer, attachment.contentType, attachment.filename);
            await setSupplierInvoiceFilePath(id, filePath);
        }

        if (invoice.emailUid && credentials) {
            markSupplierEmailRead(credentials.user, credentials.pass, invoice.emailUid).catch(err =>
                console.error('Error marcando email de proveedor como leído:', err)
            );
        }

        res.status(201).json({ id });
    } catch (err) {
        console.error('Error creando factura de proveedor:', err);
        if (id) {
            try {
                const filePath = await getSupplierInvoiceFilePath(id);
                if (filePath) removeInvoiceFile(filePath);
                await deleteSupplierInvoice(id);
            } catch (cleanupErr) {
                console.error('Error revirtiendo factura de proveedor tras fallo:', cleanupErr);
            }
        }
        res.status(500).json({ error: err.message });
    }
});

router.put('/factura/proveedor/:id', upload.single('file'), async function (req, res) {
    if (!adminGuard(req, res)) return;

    const invoice = parseInvoiceBody(req.body);
    if (!invoice.date || !invoice.supplierName || invoice.totalAmount == null) {
        return res.status(400).json({ message: 'date, supplierName y totalAmount son obligatorios' });
    }

    try {
        await updateSupplierInvoice(req.params.id, invoice);

        if (req.file) {
            const previousFilePath = await getSupplierInvoiceFilePath(req.params.id);
            if (previousFilePath) removeInvoiceFile(previousFilePath);
            const filePath = saveInvoiceFile(req.params.id, req.file.buffer, req.file.mimetype, req.file.originalname);
            await setSupplierInvoiceFilePath(req.params.id, filePath);
        }

        res.sendStatus(204);
    } catch (err) {
        console.error('Error actualizando factura de proveedor:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/factura/proveedor/:id', async function (req, res) {
    if (!adminGuard(req, res)) return;

    try {
        const filePath = await getSupplierInvoiceFilePath(req.params.id);
        await deleteSupplierInvoice(req.params.id);
        if (filePath) removeInvoiceFile(filePath);
        res.sendStatus(204);
    } catch (err) {
        console.error('Error eliminando factura de proveedor:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
