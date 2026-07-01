import express from 'express';
import { authGuard } from '../middleware/auth.js';
import { checkPendingBookingEmails, markBookingEmailsRead } from '../mail/checkBookingMails.js';
import readProperty from '../configuration/readConfiguration.js';
import executeQuery from '../sql/sqlUtils.js';

const router = express.Router();

router.get('/booking-sync/check', async (req, res) => {
    if (!authGuard(req, res)) return;

    try {
        const user = readProperty('mail.gmail.imap.user');
        const pass = readProperty('mail.gmail.imap.password');
        console.log('[booking-sync] user:', user, '| pass configurado:', !!pass);
        if (!user || !pass) return res.status(500).json({ error: 'Gmail IMAP no configurado' });
        const pending = await checkPendingBookingEmails(user, pass);
        res.json({ hasPending: pending.length > 0, emails: pending });
    } catch (err) {
        console.error('[booking-sync] ERROR:', err);
        console.error('[booking-sync] message:', err.message);
        console.error('[booking-sync] stack:', err.stack);
        res.status(500).json({ error: err.message ?? String(err) });
    }
});

router.post('/booking-sync/mark-read', async (req, res) => {
    if (!authGuard(req, res)) return;

    try {
        const user = readProperty('mail.gmail.imap.user');
        const pass = readProperty('mail.gmail.imap.password');
        if (!user || !pass) return res.status(500).json({ error: 'Gmail IMAP no configurado' });
        const count = await markBookingEmailsRead(user, pass);
        const now = new Date().toISOString();
        await executeQuery(
            'INSERT INTO casademiranda.app_settings (`key`, `value`) VALUES (?, ?),(?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
            ['last_booking_sync', now, 'booking_sync_forced_red', 'false']
        );
        res.json({ markedRead: count });
    } catch (err) {
        console.error('Error marking emails read:', err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/booking-sync/last-sync', async (req, res) => {
    if (!authGuard(req, res)) return;
    try {
        const rows = await executeQuery(
            'SELECT `key`, `value` FROM casademiranda.app_settings WHERE `key` IN (?, ?)',
            ['last_booking_sync', 'booking_sync_forced_red']
        );
        const map = Object.fromEntries((rows ?? []).map(r => [r.key, r.value]));
        res.json({
            lastSyncAt: map['last_booking_sync'] ?? null,
            forcedRed: map['booking_sync_forced_red'] === 'true',
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/booking-sync/force-red', async (req, res) => {
    if (!authGuard(req, res)) return;
    await executeQuery(
        'INSERT INTO casademiranda.app_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
        ['booking_sync_forced_red', 'true']
    );
    res.sendStatus(204);
});

router.delete('/booking-sync/force-red', async (req, res) => {
    if (!authGuard(req, res)) return;
    await executeQuery(
        'INSERT INTO casademiranda.app_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
        ['booking_sync_forced_red', 'false']
    );
    res.sendStatus(204);
});

export default router;
