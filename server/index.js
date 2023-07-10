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

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/reserva', async (req, res) =>{

    let identifier = req.query.dni;
    let bookings;
    if(identifier != null && identifier != ""){
        bookings = await listBookings.listBookingByCustomer(identifier).then((value)=> {return value});
    } else {
        bookings = await listBookings.listAllBookings().then((value)=> {return value});
    }

    res.send(bookings);
})

app.post('/reserva', async (req, res) => {
    console.log(JSON.stringify(req.body))

    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const dni = req.body.dni;
    const email = req.body.email;
    const checkinDate = req.body.fechaCheckIn;
    const fechaFactura = new Date(checkinDate).toLocaleDateString('es-ES');
    const checkOutDate = new Date(req.body.fechaCheckOut).toLocaleDateString('es-ES');
    const sendConfirmationEmail = req.body.envioConfirmacion;


    const diferenciaEnMilisegundos = new Date(req.body.fechaCheckOut) - new Date(req.body.fechaCheckIn);
    const milisegundosEnUnDia = 1000 * 60 * 60 * 24;
    const dias = Math.floor(diferenciaEnMilisegundos / milisegundosEnUnDia);
    const fechaFormateada = checkinDate.replace(/-/g, "");
    const min = 1;
    const max = 1000;
    const numeroAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
    const numeroFormateado = numeroAleatorio.toString().padStart(3, '0');
    const numeroFactura = fechaFormateada.toString() + numeroFormateado;
    const habitaciones = JSON.parse(req.body.habitaciones);

    const reserva = {
        numeroFactura: numeroFactura,
        fechaReserva: fechaFactura,
        fechaCheckIn: fechaFactura,
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

app.post('/factura', function (req, res) {

    console.log(JSON.stringify(req.body))
    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const dni = req.body.dni;
    const email = req.body.email;
    const checkinDate = req.body.fechaCheckIn;
    const fechaFactura = new Date(checkinDate).toLocaleDateString('es-ES');
    const checkOutDate = new Date(req.body.fechaCheckOut).toLocaleDateString('es-ES');
    const sendConfirmationEmail = req.body.envioConfirmacion;

    const diferenciaEnMilisegundos = new Date(req.body.fechaCheckOut) - new Date(req.body.fechaCheckIn);
    const milisegundosEnUnDia = 1000 * 60 * 60 * 24;
    const dias = Math.floor(diferenciaEnMilisegundos / milisegundosEnUnDia);
    const fechaFormateada = checkinDate.replace(/-/g, "");
    const min = 1;
    const max = 1000;
    const numeroAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
    const numeroFormateado = numeroAleatorio.toString().padStart(3, '0');
    const numeroFactura = fechaFormateada.toString() + numeroFormateado;
    const habitaciones = JSON.parse(req.body.habitaciones);

    const reserva = {
        numeroFactura: numeroFactura,
        fechaReserva: fechaFactura,
        fechaCheckIn: fechaFactura,
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
    sendMail(numeroFactura, nombre, apellidos);
    res.send('Datos recibidos correctamente.');
});

app.listen(3000, function () {
    console.log('Servidor escuchando en el puerto 3000.');
});
