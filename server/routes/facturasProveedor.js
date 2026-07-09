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
} from '../invoices/supplierInvoices.js';
import {
    checkPendingSupplierEmails,
    markSupplierEmailRead,
    downloadSupplierEmailAttachment,
} from '../mail/checkSupplierMails.js';
import { listSuppliers } from '../suppliers/suppliers.js';

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

function parseInvoiceBody(body) {
    const num = v => (v === undefined || v === null || v === '') ? null : Number(v);
    return {
        invoiceNumber: body.invoiceNumber || null,
        nif: body.nif || null,
        date: body.date,
        supplierName: body.supplierName,
        baseAmount: num(body.baseAmount),
        vatRate: num(body.vatRate),
        vatAmount: num(body.vatAmount),
        totalAmount: num(body.totalAmount),
        reference: body.reference || null,
        notes: body.notes || null,
        emailUid: body.emailUid ? Number(body.emailUid) : null,
    };
}

function saveInvoiceFile(id, buffer, contentType) {
    fs.mkdirSync(FILES_DIR, { recursive: true });
    const extension = EXTENSION_BY_CONTENT_TYPE[(contentType ?? '').toLowerCase()] ?? 'pdf';
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
        const pending = await checkPendingSupplierEmails(credentials.user, credentials.pass, knownSuppliers);
        res.json(pending);
    } catch (err) {
        console.error('Error leyendo correo de proveedores:', err);
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

    try {
        const id = await createSupplierInvoice(invoice);

        let attachment = req.file ? { buffer: req.file.buffer, contentType: req.file.mimetype } : null;
        const credentials = getImapCredentials();
        if (!attachment && invoice.emailUid && credentials) {
            try {
                attachment = await downloadSupplierEmailAttachment(credentials.user, credentials.pass, invoice.emailUid);
            } catch (err) {
                console.error('Error descargando adjunto de proveedor:', err);
            }
        }
        if (attachment) {
            const filePath = saveInvoiceFile(id, attachment.buffer, attachment.contentType);
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
            const filePath = saveInvoiceFile(req.params.id, req.file.buffer, req.file.mimetype);
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
