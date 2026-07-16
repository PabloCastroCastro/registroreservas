import express from 'express';
import multer from 'multer';
import { adminGuard } from '../middleware/auth.js';
import { listBankMovements, createBankMovement, updateBankMovement, deleteBankMovement, createBankMovements } from '../bankMovements/bankMovements.js';
import { parseBankCsv, markDuplicates } from '../bankMovements/importBankCsv.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function parseMovementBody(body) {
    return {
        date: body.date,
        type: body.type,
        description: (body.description ?? '').trim(),
        amount: Number(body.amount),
        notes: body.notes || null,
    };
}

function validateMovement(movement) {
    if (!movement.date || !movement.description || !Number.isFinite(movement.amount)) {
        return 'Fecha, razón e importe son obligatorios';
    }
    if (movement.type !== 'ingreso' && movement.type !== 'gasto') {
        return 'El tipo debe ser "ingreso" o "gasto"';
    }
    return null;
}

router.get('/movimientos-banco', async function (req, res) {
    if (!adminGuard(req, res)) return;
    try {
        const { year, quarter } = req.query;
        res.json(await listBankMovements(year, quarter));
    } catch (err) {
        console.error('Error listando movimientos de banco:', err);
        res.sendStatus(500);
    }
});

router.post('/movimientos-banco', async function (req, res) {
    if (!adminGuard(req, res)) return;
    const movement = parseMovementBody(req.body);
    const error = validateMovement(movement);
    if (error) return res.status(400).json({ message: error });

    try {
        const id = await createBankMovement(movement);
        res.status(201).json({ id });
    } catch (err) {
        console.error('Error creando movimiento de banco:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/movimientos-banco/import/preview', upload.single('file'), async function (req, res) {
    if (!adminGuard(req, res)) return;
    if (!req.file) return res.status(400).json({ message: 'Falta el fichero CSV' });

    try {
        const movements = parseBankCsv(req.file.buffer);
        if (movements.length === 0) {
            return res.status(400).json({ message: 'No se ha encontrado ningún movimiento válido en el fichero' });
        }
        res.json(await markDuplicates(movements));
    } catch (err) {
        console.error('Error leyendo CSV de movimientos de banco:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/movimientos-banco/import/commit', async function (req, res) {
    if (!adminGuard(req, res)) return;
    const movements = Array.isArray(req.body.movements) ? req.body.movements : [];
    const parsed = movements.map(parseMovementBody);
    const invalid = parsed.find(m => validateMovement(m));
    if (invalid) return res.status(400).json({ message: 'Hay movimientos incompletos en la selección' });

    try {
        const inserted = await createBankMovements(parsed);
        res.status(201).json({ inserted });
    } catch (err) {
        console.error('Error importando movimientos de banco:', err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/movimientos-banco/:id', async function (req, res) {
    if (!adminGuard(req, res)) return;
    const movement = parseMovementBody(req.body);
    const error = validateMovement(movement);
    if (error) return res.status(400).json({ message: error });

    try {
        await updateBankMovement(req.params.id, movement);
        res.sendStatus(204);
    } catch (err) {
        console.error('Error actualizando movimiento de banco:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/movimientos-banco/:id', async function (req, res) {
    if (!adminGuard(req, res)) return;
    try {
        await deleteBankMovement(req.params.id);
        res.sendStatus(204);
    } catch (err) {
        console.error('Error eliminando movimiento de banco:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
