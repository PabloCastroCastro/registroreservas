import express from 'express';
import multer from 'multer';
import { authGuard } from '../middleware/auth.js';
import { parseDNIFromImage } from '../dni/parseDNI.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/parse-dni', upload.fields([{ name: 'back', maxCount: 1 }]), async (req, res) => {
    if (!authGuard(req, res)) return;
    const files = req.files ?? {};
    if (!files.back?.[0]) return res.status(400).json({ error: 'No se recibió la imagen de la cara trasera' });
    try {
        const result = await parseDNIFromImage(files.back[0].buffer);
        res.json(result);
    } catch (err) {
        console.error('Error parsing DNI:', err.message);
        res.status(422).json({ error: err.message });
    }
});

export default router;
