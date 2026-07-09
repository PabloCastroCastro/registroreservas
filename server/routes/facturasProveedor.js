import express from 'express';
import { adminGuard } from '../middleware/auth.js';
import readProperty from '../configuration/readConfiguration.js';
import {
    listSupplierInvoices,
    createSupplierInvoice,
    updateSupplierInvoice,
    deleteSupplierInvoice,
} from '../invoices/supplierInvoices.js';
import { checkPendingSupplierEmails, markSupplierEmailRead } from '../mail/checkSupplierMails.js';

const router = express.Router();

router.get('/factura/proveedor/email-pending', async function (req, res) {
    if (!adminGuard(req, res)) return;

    try {
        const user = readProperty('mail.gmail.imap.user');
        const pass = readProperty('mail.gmail.imap.password');
        if (!user || !pass) return res.status(500).json({ error: 'Gmail IMAP no configurado' });
        const knownSuppliers = readProperty('suppliers.known') || [];
        const pending = await checkPendingSupplierEmails(user, pass, knownSuppliers);
        res.json(pending);
    } catch (err) {
        console.error('Error leyendo correo de proveedores:', err);
        res.status(500).json({ error: err.message });
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

router.post('/factura/proveedor', async function (req, res) {
    if (!adminGuard(req, res)) return;

    const { date, supplierName, totalAmount, emailUid } = req.body;
    if (!date || !supplierName || totalAmount == null) {
        return res.status(400).json({ message: 'date, supplierName y totalAmount son obligatorios' });
    }

    try {
        const id = await createSupplierInvoice(req.body);

        if (emailUid) {
            const user = readProperty('mail.gmail.imap.user');
            const pass = readProperty('mail.gmail.imap.password');
            if (user && pass) {
                markSupplierEmailRead(user, pass, emailUid).catch(err =>
                    console.error('Error marcando email de proveedor como leído:', err)
                );
            }
        }

        res.status(201).json({ id });
    } catch (err) {
        console.error('Error creando factura de proveedor:', err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/factura/proveedor/:id', async function (req, res) {
    if (!adminGuard(req, res)) return;

    const { date, supplierName, totalAmount } = req.body;
    if (!date || !supplierName || totalAmount == null) {
        return res.status(400).json({ message: 'date, supplierName y totalAmount son obligatorios' });
    }

    try {
        await updateSupplierInvoice(req.params.id, req.body);
        res.sendStatus(204);
    } catch (err) {
        console.error('Error actualizando factura de proveedor:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/factura/proveedor/:id', async function (req, res) {
    if (!adminGuard(req, res)) return;

    try {
        await deleteSupplierInvoice(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        console.error('Error eliminando factura de proveedor:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
