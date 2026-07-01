import express from 'express';
import { authGuard } from '../middleware/auth.js';
import { listDishes, listPublicDishes, createDish, updateDish, deleteDish } from '../menu/menuDishes.js';
import { buildMenuPDF } from '../menu/menuPDF.js';

const router = express.Router();

// Endpoint público — sin autenticación
router.get('/menu/pdf', async (req, res) => {
    try {
        const dishes = await listPublicDishes();
        const buffer = await buildMenuPDF(dishes);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="carta-cenas.pdf"');
        res.send(buffer);
    } catch (err) {
        console.error('Error generando PDF carta:', err);
        res.sendStatus(500);
    }
});

router.get('/menu', async (req, res) => {
    if (!authGuard(req, res)) return;
    res.json(await listDishes());
});

router.post('/menu', async (req, res) => {
    if (!authGuard(req, res)) return;
    const id = await createDish(req.body);
    res.json({ id });
});

router.put('/menu/:id', async (req, res) => {
    if (!authGuard(req, res)) return;
    await updateDish(parseInt(req.params.id), req.body);
    res.sendStatus(200);
});

router.delete('/menu/:id', async (req, res) => {
    if (!authGuard(req, res)) return;
    await deleteDish(parseInt(req.params.id));
    res.sendStatus(200);
});

export default router;
