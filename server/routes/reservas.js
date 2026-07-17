import express from 'express';
import { authGuard } from '../middleware/auth.js';
import { listAllBookings, listBookingByCustomer, listBookingById } from '../bookings/listBooking.js';
import updateBookingById from '../bookings/updateBooking.js';
import { listCustomerByBookingId } from '../clients/listClient.js';
import { saveCheckIn, buildComunicacionXml, buildDailyXml } from '../bookings/savecheckIn.js';
import { sendCheckInMail } from '../mail/sendCheckInMail.js';
import getInvoiceNumber from '../invoices/getInvoiceNumber.js';
import saveBooking from '../bookings/saveBooking.js';
import sendConfirmationBookingMail from '../confirmacion-reserva/sendMailConfirmationBooking.js';
import { checkAllRoomsAvailability } from '../bookings/checkAvailability.js';
import { listBookingDishes, addBookingDish, removeBookingDish } from '../bookings/bookingDishes.js';
import executeQuery from '../sql/sqlUtils.js';
import { isValidEmailFormat } from '../validation/email.js';

const router = express.Router();

function toIsoDateString(date) {
    const d = new Date(date);
    if (isNaN(d)) {
        throw new Error('Invalid date passed to toIsoDateString');
    }
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Debe ir antes de /reserva/:id para evitar que Express capture "disponibilidad" como id
router.get('/reserva/disponibilidad', async (req, res) => {
    if (!authGuard(req, res)) return;
    const { checkIn, checkOut, excludeId } = req.query;
    if (!checkIn || !checkOut) return res.status(400).json({ error: 'checkIn y checkOut son obligatorios' });
    const rooms = await checkAllRoomsAvailability(checkIn, checkOut, excludeId ?? null);
    res.json({ rooms });
});

router.get('/reserva', async (req, res) => {
    if (!authGuard(req, res)) return;

    console.log('query: ', JSON.stringify(req.query));

    let identifier = req.query.dni;
    let bookings;

    try {
        if (identifier) {
            bookings = await listBookingByCustomer(identifier);
        } else {
            bookings = await listAllBookings();
        }
        res.send(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.sendStatus(500);
    }
});

router.post('/reserva', async (req, res) => {
    if (!authGuard(req, res)) return;

    if (!isValidEmailFormat(req.body.email)) {
        return res.status(400).json({ message: 'El email no tiene un formato válido' });
    }

    console.log('query: ', JSON.stringify(req.query));

    console.log(JSON.stringify(req.body));

    const nombre = req.body.nombre;
    const apellido1 = req.body.apellido1 ?? req.body.apellidos ?? "";
    const apellido2 = req.body.apellido2 ?? null;
    const dni = req.body.dni;
    const email = req.body.email;
    const dateNow = new Date(Date.now());
    const bookingDate = toIsoDateString(dateNow);
    const fechaFactura = dateNow.toLocaleDateString('es-ES');
    let checkInDate;
    try {
        checkInDate = new Date(req.body.fechaCheckIn).toLocaleDateString('es-ES');
    } catch (e) {
        console.log(e);
        checkInDate = req.body.fechaCheckIn;
    }
    let checkOutDate;
    try {
        checkOutDate = new Date(req.body.fechaCheckOut).toLocaleDateString('es-ES');
    } catch (e) {
        console.log(e);
        checkOutDate = req.body.fechaCheckOut;
    }

    const sendConfirmationEmail = req.body.envioConfirmacion;
    const diferenciaEnMilisegundos = new Date(req.body.fechaCheckOut) - new Date(req.body.fechaCheckIn);
    const milisegundosEnUnDia = 1000 * 60 * 60 * 24;
    const dias = Math.floor(diferenciaEnMilisegundos / milisegundosEnUnDia);
    const numeroConfirmacion = await getInvoiceNumber(req.body.fechaCheckOut);
    let habitaciones;

    habitaciones = Array.isArray(req.body.habitaciones)
        ? req.body.habitaciones
        : JSON.parse(req.body.habitaciones);

    const reserva = {
        numeroConfirmacion: numeroConfirmacion,
        fechaReserva: fechaFactura,
        bookingDate: bookingDate,
        fechaCheckIn: checkInDate,
        fechaCheckOut: checkOutDate,
        checkInDate: req.body.fechaCheckIn,
        checkOutDate: req.body.fechaCheckOut,
        estado: req.body.estado,
        tipo_pago: req.body.tipo_pago,
        dias: dias,
        habitaciones: habitaciones,
    };

    const cliente = {
        nombre: nombre,
        apellido1: apellido1,
        apellido2: apellido2,
        dni: dni,
        email: email,
    };

    console.log('envio confirmacion reserva');
    const saved = await saveBooking(reserva, cliente);
    if (sendConfirmationEmail != null && (sendConfirmationEmail == "on" || sendConfirmationEmail == true)) {
        console.log('send mail');
        sendConfirmationBookingMail(numeroConfirmacion, cliente, reserva);
    }
    console.log('Id: ', saved);
    res.json({ id: saved });
});

router.get('/reserva/:id', async (req, res) => {
    if (!authGuard(req, res)) return;

    console.log('query: ', JSON.stringify(req.query));

    let identifier = req.params['id'];
    let bookings;
    if (identifier != null && identifier != "") {
        bookings = await listBookingById(identifier).then((value) => { return value });
    }
    console.log(bookings);

    res.send(bookings);
});

router.put('/reserva/:id', async (req, res) => {
    if (!authGuard(req, res)) return;

    const bookingId = req.params['id'];
    try {
        await updateBookingById(bookingId, req.body);
        res.sendStatus(200);
    } catch (err) {
        console.error('Error updating booking:', err);
        res.sendStatus(500);
    }
});

router.patch('/reserva/:id/cancel', async (req, res) => {
    if (!authGuard(req, res)) return;

    const id = req.params['id'];
    await executeQuery('UPDATE casademiranda.bookings SET state = ? WHERE booking_id = ?', ['cancelada', id]);
    res.sendStatus(204);
});

router.delete('/reserva/:id', async (req, res) => {
    if (!authGuard(req, res)) return;

    const id = req.params['id'];
    const rooms = await executeQuery('SELECT booking_room_id FROM casademiranda.booking_room WHERE booking_id = ?', [id]);
    for (const room of rooms) {
        await executeQuery('DELETE FROM casademiranda.booking_room_extra_bed WHERE booking_room_id = ?', [room.booking_room_id]);
    }
    await executeQuery('DELETE FROM casademiranda.booking_room WHERE booking_id = ?', [id]);
    await executeQuery('DELETE FROM casademiranda.booking_customer WHERE booking_id = ?', [id]);
    await executeQuery('DELETE FROM casademiranda.bookings WHERE booking_id = ?', [id]);
    res.sendStatus(204);
});

router.post('/reserva/:id/check-in', async (req, res) => {
    if (!authGuard(req, res)) return;

    console.log('query: ', JSON.stringify(req.query));

    let identifier = req.params['id'];
    console.log(JSON.stringify(req.body));
    if (identifier === null || identifier === "") {
        return res.sendStatus(400);
    }

    const bookings = await listBookingById(identifier).then((value) => { return value });
    console.log('Bookings:', JSON.stringify(bookings));
    if(bookings === null){
        return res.sendStatus(400);
    }

    const customers = await listCustomerByBookingId(bookings.booking_id);
    console.log('Customers:', JSON.stringify(customers));
    if(customers === null){
        return res.sendStatus(400);
    }

    await saveCheckIn(bookings, customers);
    await executeQuery(
        'UPDATE casademiranda.bookings SET checked_in_at = NOW() WHERE booking_id = ?',
        [bookings.booking_id]
    );

    res.sendStatus(204);
});

router.get('/reserva/:id/cenas', async (req, res) => {
    if (!authGuard(req, res)) return;
    res.json(await listBookingDishes(req.params.id));
});

router.post('/reserva/:id/cenas', async (req, res) => {
    if (!authGuard(req, res)) return;
    try {
        const id = await addBookingDish(req.params.id, req.body.dish_id, req.body.portion_type, req.body.quantity ?? 1, req.body.dinner_date);
        res.json({ id });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.delete('/reserva/:id/cenas/:bookingDishId', async (req, res) => {
    if (!authGuard(req, res)) return;
    await removeBookingDish(req.params.bookingDishId);
    res.sendStatus(200);
});

router.get('/checkin-preview', async (req, res) => {
    if (!authGuard(req, res)) return;

    const fecha = req.query.fecha ?? new Date().toISOString().split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({ error: 'fecha debe tener formato YYYY-MM-DD' });
    }

    const rows = await executeQuery(
        'SELECT booking_id FROM casademiranda.bookings WHERE DATE(checked_in_at) = ?',
        [fecha]
    );

    if (!rows || rows.length === 0) {
        return res.json({ fecha, total: 0, comunicaciones: [] });
    }

    const comunicaciones = [];
    for (const row of rows) {
        const booking = await listBookingById(row.booking_id);
        const customers = await listCustomerByBookingId(row.booking_id);
        if (booking && customers) {
            comunicaciones.push({
                referencia: booking.confirmation_number,
                check_in: booking.check_in,
                check_out: booking.check_out,
                habitaciones: booking.rooms?.length ?? 0,
                personas: customers.map(c => ({
                    nombre: c.name,
                    apellido1: c.surname,
                    apellido2: c.surname2 ?? null,
                    tipoDocumento: c.document_type,
                    numeroDocumento: c.identifier,
                })),
            });
        }
    }

    res.json({ fecha, total: comunicaciones.length, comunicaciones });
});

router.get('/checkin-xml', async (req, res) => {
    if (!authGuard(req, res)) return;

    const fecha = req.query.fecha ?? new Date().toISOString().split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({ error: 'fecha debe tener formato YYYY-MM-DD' });
    }

    const rows = await executeQuery(
        'SELECT booking_id FROM casademiranda.bookings WHERE DATE(checked_in_at) = ?',
        [fecha]
    );

    if (!rows || rows.length === 0) {
        return res.status(404).json({ error: `No hay check-ins registrados para ${fecha}` });
    }

    const comunicaciones = [];
    for (const row of rows) {
        const booking = await listBookingById(row.booking_id);
        const customers = await listCustomerByBookingId(row.booking_id);
        if (booking && customers) {
            comunicaciones.push(buildComunicacionXml(booking, customers));
        }
    }

    const xml = buildDailyXml(comunicaciones);
    res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
    res.setHeader('Content-Disposition', `attachment; filename="checkin_${fecha}.xml"`);
    res.send(xml);
});

router.post('/checkin-xml/email', async (req, res) => {
    if (!authGuard(req, res)) return;

    const fecha = req.query.fecha ?? new Date().toISOString().split('T')[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
        return res.status(400).json({ error: 'fecha debe tener formato YYYY-MM-DD' });
    }

    const rows = await executeQuery(
        'SELECT booking_id FROM casademiranda.bookings WHERE DATE(checked_in_at) = ?',
        [fecha]
    );

    if (!rows || rows.length === 0) {
        return res.status(404).json({ error: `No hay check-ins registrados para ${fecha}` });
    }

    const comunicaciones = [];
    for (const row of rows) {
        const booking = await listBookingById(row.booking_id);
        const customers = await listCustomerByBookingId(row.booking_id);
        if (booking && customers) {
            comunicaciones.push(buildComunicacionXml(booking, customers));
        }
    }

    const xml = buildDailyXml(comunicaciones);

    try {
        await sendCheckInMail(fecha, xml, rows.length);
        res.sendStatus(204);
    } catch (err) {
        console.error('[checkin-xml/email] Error enviando email:', err.message);
        res.status(500).json({ error: 'Error al enviar el email' });
    }
});

export default router;
