import express from 'express';
import { authGuard } from '../middleware/auth.js';
import { save, update } from '../clients/saveClient.js';
import { listAllCustomers, listCustomerById, listCustomerByBookingId, listCustomerByIdentifier } from '../clients/listClient.js';

const router = express.Router();

router.post('/cliente', async (req, res) => {
    if (!authGuard(req, res)) return;

    console.log('query: ', JSON.stringify(req.query));

    const reserva = req.body.booking_id;
    const cliente = {
        cliente_id: req.body.client_id,
        nombre: req.body.name,
        apellido1: req.body.firstSurname,
        apellido2: req.body.secondSurname ?? null,
        nacionalidad: req.body.nacionality,
        tipo_documento: req.body.document_type,
        numero_documento: req.body.document_number,
        soporte_documento: req.body.support_document,
        fecha_expedicion: req.body.expedition_date,
        genero: req.body.gender,
        fecha_nacimiento: req.body.birthdate,
        telefono: req.body.phone,
        otro_telefono: req.body.other_phone,
        correo: req.body.email,
        parentesco: req.body.relationship,
        direccion: req.body.address,
        hizo_reserva: req.body.made_booking
    };

    console.log('Reserva: ', reserva, 'Customer: ', JSON.stringify(cliente));

    let clients = await save(reserva, cliente);

    console.log('Client Id: ', JSON.stringify(clients));
    res.send("Cliente registrado correctamente");
});

router.put('/cliente', async (req, res) => {
    if (!authGuard(req, res)) return;

    console.log('query: ', JSON.stringify(req.query));

    const reserva = req.body.booking_id;
    const cliente = {
        cliente_id: req.body.client_id,
        nombre: req.body.name,
        apellido1: req.body.firstSurname,
        apellido2: req.body.secondSurname ?? null,
        nacionalidad: req.body.nacionality,
        tipo_documento: req.body.document_type,
        numero_documento: req.body.document_number,
        soporte_documento: req.body.support_document,
        fecha_expedicion: req.body.expedition_date,
        genero: req.body.gender,
        fecha_nacimiento: req.body.birthdate,
        telefono: req.body.phone,
        otro_telefono: req.body.other_phone,
        correo: req.body.email,
        parentesco: req.body.relationship,
        direccion: req.body.address,
        hizo_reserva: req.body.made_booking
    };

    try {
        let clients = await update(reserva, cliente);
        res.send(clients);
    } catch (error) {
        console.error('Error actualizando cliente:', error);
        res.status(500).json({ error: 'Error al actualizar cliente' });
    }
});

router.get('/cliente', async (req, res) => {
    if (!authGuard(req, res)) return;

    console.log('query: ', JSON.stringify(req.query));

    let identifier = req.query.dni;
    let reservaId = req.query.reservaId;
    let clients;
    if (identifier != null && identifier != "") {
        clients = await listCustomerByIdentifier(identifier).then((value) => { return value });
    } else if (reservaId !== null && reservaId !== "") {
        clients = await listCustomerByBookingId(reservaId).then((value) => { return value });
    } else {
        clients = await listAllCustomers().then((value) => { return value });
    }
    console.log('no for id Clients: ', JSON.stringify(clients));

    res.send(clients);
});

router.get('/cliente/:id', async (req, res) => {
    if (!authGuard(req, res)) return;

    console.log('query: ', JSON.stringify(req.query));

    let client_id = req.params['id'];
    if (client_id != null && client_id != "") {
        try {
            const client = await listCustomerById(client_id);
            console.log('Clients: ', JSON.stringify(client));
            return res.send(client);
        } catch (err) {
            console.error('Error fetching client:', err);
            return res.sendStatus(500);
        }
    }
    res.sendStatus(400);
});

export default router;
