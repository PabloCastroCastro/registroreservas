import express from 'express';
import { authGuard, adminGuard } from '../middleware/auth.js';
import { listBasePrices, updateBasePrice, updateSeasonConfig, getPriceForRoomAndDate } from '../rooms/roomPrices.js';
import { listBookingRoomPrices, updateBookingRoomPrice } from '../rooms/bookingRoomPrices.js';

const router = express.Router();

router.get('/precios-base', async (req, res) => {
    if (!authGuard(req, res)) return;
    res.json(await listBasePrices());
});

router.get('/precios-base/precio', async (req, res) => {
    if (!authGuard(req, res)) return;
    const { room, date } = req.query;
    if (!room || !date) return res.status(400).json({ error: 'room y date son obligatorios' });
    const result = await getPriceForRoomAndDate(room, date);
    if (!result) return res.status(404).json({ error: 'No hay precio configurado' });
    res.json(result);
});

router.put('/precios-base/season-config', async (req, res) => {
    if (!adminGuard(req, res)) return;
    await updateSeasonConfig(req.body.high_season_start, req.body.high_season_end);
    res.sendStatus(200);
});

router.put('/precios-base/:id', async (req, res) => {
    if (!adminGuard(req, res)) return;
    await updateBasePrice(req.params.id, req.body.price, req.body.price_extra_bed);
    res.sendStatus(200);
});

router.get('/precios-booking', async (req, res) => {
    if (!authGuard(req, res)) return;
    res.json(await listBookingRoomPrices());
});

router.put('/precios-booking/:id', async (req, res) => {
    if (!adminGuard(req, res)) return;
    await updateBookingRoomPrice(req.params.id, req.body.price);
    res.sendStatus(200);
});

export default router;
