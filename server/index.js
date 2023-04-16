const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const generarFactura = require('./pdf/createPDF');
const readFileExcel = require('./excel/functionsExcel');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());


app.post('/factura', function (req, res) {

    console.log(JSON.stringify(req.body))
    const nombre = req.body.nombre;
    const apellidos = req.body.apellidos;
    const dni = req.body.dni;
    const checkinDate = req.body.fechaCheckIn;
    const fechaFactura = new Date(checkinDate).toLocaleDateString('es-ES');
    const checkOutDate = new Date(req.body.fechaCheckOut).toLocaleDateString('es-ES');

    const diferenciaEnMilisegundos = new Date(req.body.fechaCheckOut) - new Date(req.body.fechaCheckIn);
    const milisegundosEnUnDia = 1000 * 60 * 60 * 24;
    const dias = Math.floor(diferenciaEnMilisegundos / milisegundosEnUnDia);
    const fechaFormateada = checkinDate.replace(/-/g,"");
    const min = 1;
    const max = 1000;
    const numeroAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
    const numeroFormateado = numeroAleatorio.toString().padStart(3, '0');
    const numeroFactura = fechaFormateada.toString() + numeroFormateado;
    const habitaciones = JSON.parse(req.body.habitaciones);

    console.log(habitaciones);
    console.log(numeroFactura); // Ejemplo de salida: "20230407"


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
        dni: dni
    };
    
    console.log(reserva);
    console.log(dias);


    // Hacer algo con los datos recibidos, como guardarlos en una base de datos
    // modificar datos de un excel y subirlo al drive
    readFileExcel(numeroFactura,fechaFactura);
    generarFactura(reserva, cliente);

    res.send('Datos recibidos correctamente.');
});

app.listen(3000, function () {
  console.log('Servidor escuchando en el puerto 3000.');
});
