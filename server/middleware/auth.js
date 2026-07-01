import jwt from 'jsonwebtoken';
import readProperty from '../configuration/readConfiguration.js';

const SECRET_KEY = readProperty('server.secretKey');

export function authGuard(req, res) {
    const token = (req.headers['authorization'] ?? '').split(' ')[1];
    if (!token) { res.sendStatus(401); return false; }
    try { jwt.verify(token, SECRET_KEY); return true; } catch { res.sendStatus(403); return false; }
}

export function adminGuard(req, res) {
    const token = (req.headers['authorization'] ?? '').split(' ')[1];
    if (!token) { res.sendStatus(401); return false; }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded.role !== 'admin') { res.sendStatus(403); return false; }
        return true;
    } catch { res.sendStatus(403); return false; }
}
