import express from 'express';
import fs from 'fs';
import { authGuard, adminGuard } from '../middleware/auth.js';
import { generarFactura, previewFactura } from '../pdf/createPDF.js';
import sendMail from '../mail/sendMail.js';
import listInvoices from '../invoices/listInvoices.js';
import executeQuery from '../sql/sqlUtils.js';

const router = express.Router();

const CONFIRMATION_NUMBER_RE = /^\d{11}$/;

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

router.get('/factura/list', async function (req, res) {
    if (!adminGuard(req, res)) return;

    try {
        const { year, quarter } = req.query;
        const invoices = await listInvoices(year, quarter);
        res.json(invoices);
    } catch (err) {
        console.error('Error listando facturas:', err);
        res.sendStatus(500);
    }
});

router.get('/factura/:confirmationNumber/pdf', function (req, res) {
    if (!adminGuard(req, res)) return;

    const { confirmationNumber } = req.params;
    if (!CONFIRMATION_NUMBER_RE.test(confirmationNumber)) return res.sendStatus(400);

    try {
        const buffer = fs.readFileSync('./facturas-cliente/' + confirmationNumber + '.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${confirmationNumber}.pdf"`);
        res.send(buffer);
    } catch (err) {
        res.sendStatus(404);
    }
});

router.post('/factura/:confirmationNumber/resend', async function (req, res) {
    if (!adminGuard(req, res)) return;

    const { confirmationNumber } = req.params;
    if (!CONFIRMATION_NUMBER_RE.test(confirmationNumber)) return res.sendStatus(400);

    try {
        const rows = await executeQuery(
            `SELECT c.name, c.surname, c.email FROM casademiranda.bookings b
             INNER JOIN casademiranda.booking_customer bc ON b.booking_id = bc.booking_id
             INNER JOIN casademiranda.customers c ON bc.customer_id = c.customer_id AND c.made_booking = 1
             WHERE b.confirmation_number = ?`,
            [confirmationNumber]
        );
        if (!rows || rows.length === 0) return res.sendStatus(404);

        const { name, surname, email } = rows[0];
        sendMail(confirmationNumber, name, surname, email);
        res.sendStatus(200);
    } catch (err) {
        console.error('Error reenviando factura:', err);
        res.sendStatus(500);
    }
});

export default router;
