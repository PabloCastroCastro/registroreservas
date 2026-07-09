import express from 'express';
import { adminGuard } from '../middleware/auth.js';
import { listSuppliers, findSupplierByDomain, createSupplier, updateSupplier, deleteSupplier } from '../suppliers/suppliers.js';

const router = express.Router();

router.get('/proveedores', async function (req, res) {
    if (!adminGuard(req, res)) return;
    try {
        res.json(await listSuppliers());
    } catch (err) {
        console.error('Error listando proveedores:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/proveedores', async function (req, res) {
    if (!adminGuard(req, res)) return;
    const name = (req.body.name ?? '').trim();
    const domain = (req.body.domain ?? '').trim().toLowerCase();
    if (!name || !domain) {
        return res.status(400).json({ message: 'name y domain son obligatorios' });
    }
    try {
        const existing = await findSupplierByDomain(domain);
        if (existing) return res.status(409).json({ message: 'Ya existe un proveedor con ese dominio' });
        const id = await createSupplier(name, domain);
        res.status(201).json({ id });
    } catch (err) {
        console.error('Error creando proveedor:', err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/proveedores/:id', async function (req, res) {
    if (!adminGuard(req, res)) return;
    const name = (req.body.name ?? '').trim();
    const domain = (req.body.domain ?? '').trim().toLowerCase();
    if (!name || !domain) {
        return res.status(400).json({ message: 'name y domain son obligatorios' });
    }
    try {
        const existing = await findSupplierByDomain(domain, req.params.id);
        if (existing) return res.status(409).json({ message: 'Ya existe un proveedor con ese dominio' });
        await updateSupplier(req.params.id, name, domain);
        res.sendStatus(204);
    } catch (err) {
        console.error('Error actualizando proveedor:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/proveedores/:id', async function (req, res) {
    if (!adminGuard(req, res)) return;
    try {
        await deleteSupplier(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        console.error('Error eliminando proveedor:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
