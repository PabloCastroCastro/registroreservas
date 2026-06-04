import express, { response } from 'express';
import multer from "multer";
import XLSX from "xlsx";
import https from 'https';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import { generarFactura, previewFactura } from './pdf/createPDF.js';
import getInvoiceNumber from './invoices/getInvoiceNumber.js';
import readFileExcel from './excel/functionsExcel.js';
import sendMail from './mail/sendMail.js';
import sendConfirmationBookingMail from './confirmacion-reserva/sendMailConfirmationBooking.js';
import saveBooking from './bookings/saveBooking.js';
import { listAllBookings, listBookingByCustomer, listBookingById } from './bookings/listBooking.js';
import updateBookingById from './bookings/updateBooking.js';
import { checkPendingBookingEmails, markBookingEmailsRead } from './mail/checkBookingMails.js';
import { save, update } from './clients/saveClient.js';
import { listAllCustomers, listCustomerById, listCustomerByBookingId, listCustomerByIdentifier } from './clients/listClient.js';
import { getUserByUsername } from './users/getUser.js'
import { createUser } from './users/saveUser.js'
import { saveCheckIn } from './bookings/savecheckIn.js'

import getBookingNumber from './bookings/getBookingNumber.js';
import readProperty from './configuration/readConfiguration.js';
import executeQuery from './sql/sqlUtils.js';
import e from 'express';

const app = express();
const SECRET_KEY = readProperty("server.secretKey");
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(cors());

const parseFloatFromText = (str) => typeof str === "string" ? parseFloat(str.replace(/[^\d.-]/g, '')) : str;

const getRoomName = (rowName) => {
    if (!rowName) return '';
    const name = rowName.toLowerCase();
    if (name.includes('carpinteiro')) return 'O Carpinteiro';
    if (name.includes('fonte'))       return 'A Fonte';
    if (name.includes('cuberto'))     return 'O Cuberto';
    if (name.includes('faiado'))      return 'O Faiado';
    return rowName;
}

function formatDateToMySQL(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date)) return null;
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function buildHabitaciones(row) {
    const tipoUnidad = row['Tipo de unidad'];
    const numHabitaciones = parseInt(row['Habitaciones']) || 0;
    const dias = parseInt(row['Duración (noches)']) || 1;
    const precioTotal = parseFloatFromText(row['Precio']);

    if (numHabitaciones === 0) return [];

    if (numHabitaciones === 1) {
        return [
            {
                habitacion: getRoomName(tipoUnidad),
                precio: precioTotal / dias
            }
        ];
    }

    const tipos = tipoUnidad.split(',').map(t => t.trim());
    if (tipos.length !== numHabitaciones) {
        throw new Error('Datos inválidos: el número de tipos de unidad no coincide con el número de habitaciones');
    }

    const precioUnitario = precioTotal / (numHabitaciones * dias);

    return tipos.map(tipo => ({
        habitacion: getRoomName(tipo),
        precio: precioUnitario
    }));
}

app.get('/booking-sync/check', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    try { jwt.verify(token, SECRET_KEY); } catch { return res.sendStatus(403); }

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

app.post('/booking-sync/mark-read', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    try { jwt.verify(token, SECRET_KEY); } catch { return res.sendStatus(403); }

    try {
        const user = readProperty('mail.gmail.imap.user');
        const pass = readProperty('mail.gmail.imap.password');
        if (!user || !pass) return res.status(500).json({ error: 'Gmail IMAP no configurado' });
        const count = await markBookingEmailsRead(user, pass);
        res.json({ markedRead: count });
    } catch (err) {
        console.error('Error marking emails read:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/upload-booking', upload.single("excelFile"), async function (req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err) => {
        if (err) return res.sendStatus(403);
    });

    if (!req.file) {
        return res.status(400).json({ message: "Archivo no encontrado" });
    }

    try {
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        console.log("Datos procesados:", data);

        let reservasCreadas = 0;
        let reservasOmitidas = 0;
        const errores = [];

        for (const row of data) {
            const referencia = row['Número de reserva'] ?? '(sin referencia)';
            try {
                const [apellidosFull, nombre] = row['Reservado por']
                    ? row['Reservado por'].split(',').map((s) => s.trim())
                    : ["", ""];
                const apellidosParts = apellidosFull.split(' ').filter(Boolean);
                const apellido1 = apellidosParts[0] ?? "";
                const apellido2 = apellidosParts.length > 1 ? apellidosParts.slice(1).join(' ') : null;

                const numeroConfirmacion = await getInvoiceNumber(row['Salida']);
                const dias = parseInt(row['Duración (noches)']) || 1;
                const habitaciones = buildHabitaciones(row);

                const reserva = {
                    numeroConfirmacion,
                    bookingDate: formatDateToMySQL(row['Fecha de reserva']),
                    checkInDate: formatDateToMySQL(row['Entrada']),
                    checkOutDate: formatDateToMySQL(row['Salida']),
                    dias,
                    habitaciones,
                    tipo_pago: '',
                    referenciaOtraPlataforma: referencia,
                    estado: row['Estado']
                };

                const cliente = {
                    nombre: nombre,
                    apellido1: apellido1,
                    apellido2: apellido2,
                    dni: "",
                    email: "",
                };

                const existing = await executeQuery(
                    'SELECT booking_id FROM casademiranda.bookings WHERE other_platform_reference = ?',
                    [referencia]
                );
                if (existing.length > 0) {
                    reservasOmitidas++;
                } else {
                    await saveBooking(reserva, cliente);
                    reservasCreadas++;
                }
            } catch (err) {
                console.error("Error procesando fila:", row, err);
                errores.push({ referencia, error: err.message });
            }
        }

        res.json({
            message: "Archivo procesado correctamente",
            reservasCreadas,
            reservasOmitidas,
            errores,
        });
    } catch (err) {
        console.error("Error al procesar Excel:", err);
        res.status(500).json({ message: "Error al procesar archivo" });
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/register', async (req, res) => {
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

        const newUser = await createUser(username, hashedPassword);
        console.log('Usuario creado:', newUser);

        const token = jwt.sign({ id: newUser.id }, SECRET_KEY, { expiresIn: '1h' });
        return res.status(201).json({ message: 'Usuario registrado con éxito', token });
    });
});

app.post('/loginuser', async (req, res) => {
    const { username, password } = req.body;
    const user = await getUserByUsername(username).then((value) => { return value });

    if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ message: 'Login correcto', token });
});

app.post('/cliente', async (req, res) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    console.log('query: ', JSON.stringify(req.query));

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
    });


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
})

app.put('/cliente', async (req, res) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    console.log('query: ', JSON.stringify(req.query));

    jwt.verify(token, SECRET_KEY, async (err, user) => {
        if (err) return res.sendStatus(403);
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

})

app.get('/cliente', async (req, res) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    console.log('query: ', JSON.stringify(req.query));

    jwt.verify(token, SECRET_KEY, async (err, user) => {
        if (err) return res.sendStatus(403);
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


})

app.get('/cliente/:id', async (req, res) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    console.log('query: ', JSON.stringify(req.query));

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
    });


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
})

app.get('/reserva', async (req, res) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    console.log('query: ', JSON.stringify(req.query));

    jwt.verify(token, SECRET_KEY, async (err, user) => {
        if (err) return res.sendStatus(403);

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
})

app.get('/reserva/:id', async (req, res) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    console.log('query: ', JSON.stringify(req.query));

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
    });


    let identifier = req.params['id'];
    let bookings;
    if (identifier != null && identifier != "") {
        bookings = await listBookingById(identifier).then((value) => { return value });
    }
    console.log(bookings);

    res.send(bookings);
})

app.post('/reserva/:id/check-in', async (req, res) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    console.log('query: ', JSON.stringify(req.query));

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
    });


    let identifier = req.params['id'];
    console.log(JSON.stringify(req.body))
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

    const registerCheckIn = await saveCheckIn(bookings, customers);

    res.sendStatus(204);
})

app.patch('/reserva/:id/cancel', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err) => { if (err) return res.sendStatus(403); });

    const id = req.params['id'];
    await executeQuery('UPDATE casademiranda.bookings SET state = ? WHERE booking_id = ?', ['cancelada', id]);
    res.sendStatus(204);
});

app.delete('/reserva/:id', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err) => { if (err) return res.sendStatus(403); });

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

app.put('/reserva/:id', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
    });

    const bookingId = req.params['id'];
    try {
        await updateBookingById(bookingId, req.body);
        res.sendStatus(200);
    } catch (err) {
        console.error('Error updating booking:', err);
        res.sendStatus(500);
    }
});

app.post('/reserva', async (req, res) => {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    console.log('query: ', JSON.stringify(req.query));

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
    });


    console.log(JSON.stringify(req.body))

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
})

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

app.post('/factura/preview', async function (req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    try { jwt.verify(token, SECRET_KEY); } catch { return res.sendStatus(403); }

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

app.post('/factura', async function (req, res) {

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    try { jwt.verify(token, SECRET_KEY); } catch { return res.sendStatus(403); }

    const { reserva, cliente } = parseBillBody(req.body);
    await generarFactura(reserva, cliente);
    sendMail(reserva.numeroFactura, cliente.nombre, cliente.apellidos, cliente.email);
    res.send('Datos recibidos correctamente.');
});


app.listen(3003, function () {
    console.log('Servidor escuchando en el puerto 3003.');
});

const options = {
    key: fs.readFileSync('../infrastructure/certs/casademiranda.key', 'utf8'),
    cert: fs.readFileSync('../infrastructure/certs/casademiranda.crt', 'utf8'),
};

// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(443);