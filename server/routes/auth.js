import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import readProperty from '../configuration/readConfiguration.js';
import { getUserByUsername } from '../users/getUser.js';
import { createUser } from '../users/saveUser.js';

const router = express.Router();
const SECRET_KEY = readProperty('server.secretKey');

router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username y password requeridos' });
    }

    const existingUser = await getUserByUsername(username);
    if (existingUser) {
        return res.status(409).json({ message: 'El usuario ya existe' });
    }

    bcrypt.hash(password, 12, async (err, hashedPassword) => {
        if (err) {
            console.error('Error al hashear la contraseña:', err);
            return res.status(500).json({ message: 'Error interno' });
        }

        const newUser = await createUser(username, hashedPassword, 'admin');
        console.log('Usuario creado:', newUser);

        const token = jwt.sign({ id: newUser.insertId, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        return res.status(201).json({ message: 'Usuario registrado con éxito', token });
    });
});

router.post('/loginuser', async (req, res) => {
    const { username, password } = req.body;
    const user = await getUserByUsername(username).then((value) => { return value });

    if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ message: 'Login correcto', token });
});

export default router;
