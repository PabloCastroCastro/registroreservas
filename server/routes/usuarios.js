import express from 'express';
import bcrypt from 'bcryptjs';
import { adminGuard } from '../middleware/auth.js';
import { getUserByUsername } from '../users/getUser.js';
import { createUser } from '../users/saveUser.js';
import executeQuery from '../sql/sqlUtils.js';

const router = express.Router();

router.get('/usuarios', async (req, res) => {
    if (!adminGuard(req, res)) return;
    try {
        const users = await executeQuery('SELECT id, username, role FROM casademiranda.users ORDER BY id');
        res.json(users);
    } catch (err) {
        console.error('Error listing users:', err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/usuarios', async (req, res) => {
    if (!adminGuard(req, res)) return;
    const { username, password, role } = req.body;
    if (!username || !password || !['admin', 'manager'].includes(role)) {
        return res.status(400).json({ message: 'username, password y role (admin|manager) son requeridos' });
    }
    try {
        const existing = await getUserByUsername(username);
        if (existing) return res.status(409).json({ message: 'El usuario ya existe' });
        const hash = await bcrypt.hash(password, 12);
        await createUser(username, hash, role);
        res.status(201).json({ message: 'Usuario creado' });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/usuarios/:id/role', async (req, res) => {
    if (!adminGuard(req, res)) return;
    const { role } = req.body;
    if (!['admin', 'manager'].includes(role)) {
        return res.status(400).json({ message: 'role debe ser admin o manager' });
    }
    try {
        await executeQuery('UPDATE casademiranda.users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.sendStatus(204);
    } catch (err) {
        console.error('Error changing role:', err);
        res.status(500).json({ error: err.message });
    }
});

router.put('/usuarios/:id/password', async (req, res) => {
    if (!adminGuard(req, res)) return;
    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'password es obligatorio' });
    try {
        const hash = await bcrypt.hash(password, 12);
        await executeQuery('UPDATE casademiranda.users SET password_hash = ? WHERE id = ?', [hash, req.params.id]);
        res.sendStatus(204);
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).json({ error: err.message });
    }
});

router.delete('/usuarios/:id', async (req, res) => {
    if (!adminGuard(req, res)) return;
    try {
        await executeQuery('DELETE FROM casademiranda.users WHERE id = ?', [req.params.id]);
        res.sendStatus(204);
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
