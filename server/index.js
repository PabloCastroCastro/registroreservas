const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const generarFactura = require('./pdf/createPDF');
const readFileExcel = require('./excel/functionsExcel');
const sendMail = require('./mail/sendMail');
const sendConfirmationBookingMail = require('./confirmacion-reserva/sendMailConfirmationBooking');
const saveBooking = require('./bookings/saveBooking')
const listBookings = require('./bookings/listBooking');
const getBookingNumber = require('./bookings/getBookingNumber');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/reserva', async (req, res) => {

    let identifier = req.query.dni;
    let bookings;
    if (identifier != null && identifier != "") {
        bookings = await listBookings.listBookingByCustomer(identifier).then((value) => { return value });
    } else {
        bookings = await listBookings.listAllBookings().then((value) => { return value });
    }

    res.send(bookings);
})

app.get('/reserva/:id', async (req, res) => {

    let identifier = req.params['id'];
    let bookings;
    if (identifier != null && identifier != "") {
        bookings = await listBookings.listBookingById(identifier).then((value) => { return value });
    }
    console.log(bookings);

    res.send(bookings);
})

app.post('/reserva', async (req, res) => {
    console.log(JSON.stringify(req.body))

    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const dni = req.body.dni;
    const email = req.body.email;
    const dateNow = new Date(Date.now());
    const fechaFactura = dateNow.toLocaleDateString('es-ES');
    let checkInDate;
    try{
        checkInDate = new Date(req.body.fechaCheckIn).toLocaleDateString('es-ES');
    }catch(e){
        console.log(e);
        checkInDate = req.body.fechaCheckIn;
    }
    let checkOutDate;
    try{
        checkOutDate = new Date(req.body.fechaCheckOut).toLocaleDateString('es-ES');
    }catch(e){
        console.log(e);
        checkOutDate = req.body.fechaCheckOut;
    }

    const sendConfirmationEmail = req.body.envioConfirmacion;
    const diferenciaEnMilisegundos = new Date(req.body.fechaCheckOut) - new Date(req.body.fechaCheckIn);
    const milisegundosEnUnDia = 1000 * 60 * 60 * 24;
    const dias = Math.floor(diferenciaEnMilisegundos / milisegundosEnUnDia);
    const fechaFormateada = dateNow.toISOString().split("T")[0].replace(/-/g, "");
    let numeroFactura = await getBookingNumber.getBookingNumber(fechaFormateada.toString()).then(value => {return value});
    try{
        habitaciones = JSON.parse(req.body.habitaciones);
    } catch(e){
        console.log(e);
        habitaciones = req.body.habitaciones;
    }

    const reserva = {
        numeroFactura: numeroFactura,
        fechaReserva: fechaFactura,
        fechaCheckIn: checkInDate,
        fechaCheckOut: checkOutDate,
        checkInDate: req.body.fechaCheckIn,
        checkOutDate: req.body.fechaCheckOut,
        dias: dias,
        habitaciones: habitaciones,
    };

    const cliente = {
        nombre: nombre,
        apellidos: apellidos,
        dni: dni,
        email: email,
    };

    console.log('envio confirmacion reserva');
    await saveBooking.save(reserva, cliente);
    if (sendConfirmationEmail != null && sendConfirmationEmail == "on") {
        console.log('send mail');
        sendConfirmationBookingMail(numeroFactura, cliente, reserva);
    }
    res.send('Reserva generada correctamente.');
})

app.post('/factura', async function (req, res) {

    console.log('Factura: ', JSON.stringify(req.body))
    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const dni = req.body.dni;
    const email = req.body.email;
    const dateNow = new Date(Date.now());
    const fechaFactura = dateNow.toLocaleDateString('es-ES');
    const checkInDate = new Date(req.body.fechaCheckIn).toLocaleDateString('es-ES');
    const checkOutDate = new Date(req.body.fechaCheckOut).toLocaleDateString('es-ES');
    const sendConfirmationEmail = req.body.envioConfirmacion;

    const diferenciaEnMilisegundos = new Date(req.body.fechaCheckOut) - new Date(req.body.fechaCheckIn);
    const milisegundosEnUnDia = 1000 * 60 * 60 * 24;
    const dias = Math.floor(diferenciaEnMilisegundos / milisegundosEnUnDia);
    const fechaFormateada = dateNow.toISOString().split("T")[0].replace(/-/g, "");
    let numeroFactura = await getBookingNumber.getBookingNumber(fechaFormateada.toString()).then(value => {return value});
    let habitaciones;
    try{
        habitaciones = JSON.parse(req.body.habitaciones);
    } catch(e){
        console.log(e);
        habitaciones = req.body.habitaciones;
    }
    
    const reserva = {
        numeroFactura: numeroFactura,
        fechaReserva: fechaFactura,
        fechaCheckIn: checkInDate,
        fechaCheckOut: checkOutDate,
        dias: dias,
        habitaciones: habitaciones,
    };

    const cliente = {
        nombre: nombre,
        apellidos: apellidos,
        dni: dni,
        email: email,
    };

    console.log(reserva);
    console.log(dias);

    readFileExcel(numeroFactura, fechaFactura);
    generarFactura(reserva, cliente);
    sendMail(numeroFactura, nombre, apellidos, email);
    res.send('Datos recibidos correctamente.');
});

app.listen(3003, function () {
    console.log('Servidor escuchando en el puerto 3003.');
});
