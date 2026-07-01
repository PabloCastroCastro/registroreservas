import express from 'express';
import { authGuard } from '../middleware/auth.js';
import { generarFactura, previewFactura } from '../pdf/createPDF.js';
import sendMail from '../mail/sendMail.js';

const router = express.Router();

function parseBillBody(body) {
    const checkInDate = new Date(body.fechaCheckIn).toLocaleDateString('es-ES');
    const checkOutDate = new Date(body.fechaCheckOut).toLocaleDateString('es-ES');
    const dias = Math.floor((new Date(body.fechaCheckOut) - new Date(body.fechaCheckIn)) / 86400000);

    const habitaciones = Array.isArray(body.habitaciones)
        ? body.habitaciones
        : JSON.parse(body.habitaciones);

    let extras = body.extras ?? [];
    if (typeof extras === 'string') { try { extras = JSON.parse(extras); } catch { extras = []; } }

    const reserva = {
        numeroFactura: body.numeroFactura,
        fechaReserva: checkOutDate,
        fechaCheckIn: checkInDate,
        fechaCheckOut: checkOutDate,
        dias,
        habitaciones,
        tipo: body.tipo ?? 'personal',
        concepto: body.concepto ?? null,
        extras,
    };
    const cliente = {
        nombre: body.nombre,
        apellidos: body.apellidos,
        dni: body.dni,
        email: body.email,
        direccion: body.direccion ?? null,
        nombreEmpresa: body.nombreEmpresa ?? null,
        codigoPostalCiudad: body.codigoPostalCiudad ?? null,
        pais: body.pais ?? null,
    };
    return { reserva, cliente };
}

router.post('/factura/preview', async function (req, res) {
    if (!authGuard(req, res)) return;

    try {
        const { reserva, cliente } = parseBillBody(req.body);
        const buffer = await previewFactura(reserva, cliente);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="preview.pdf"');
        res.send(buffer);
    } catch (err) {
        console.error('Error generando preview factura:', err);
        res.sendStatus(500);
    }
});

router.post('/factura', async function (req, res) {
    if (!authGuard(req, res)) return;

    const { reserva, cliente } = parseBillBody(req.body);
    await generarFactura(reserva, cliente);
    sendMail(reserva.numeroFactura, cliente.nombre, cliente.apellidos, cliente.email);
    res.send('Datos recibidos correctamente.');
});

export default router;
