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
    const fechaFormateada = checkinDate.replace(/-/g,"");
    const min = 1;
    const max = 1000;
    const numeroAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
    const numeroFormateado = numeroAleatorio.toString().padStart(3, '0');
    const numeroFactura = fechaFormateada.toString() + numeroFormateado;

    console.log(numeroFactura); // Ejemplo de salida: "20230407"


    const reserva = {
        numeroFactura: numeroFactura,
        fechaReserva: fechaFactura,
        fechaCheckIn: fechaFactura,
        fechaCheckOut: checkOutDate,
        habitacion:'O Carpinteiro',
        dias: 1,
        supletoria:'no',
        precio: 90
    };

    const cliente = {
        nombre: nombre,
        apellidos: apellidos,
        dni: dni
    };
    
    

    // Hacer algo con los datos recibidos, como guardarlos en una base de datos
    // modificar datos de un excel y subirlo al drive
    readFileExcel(numeroFactura,fechaFactura);
    generarFactura(reserva, cliente);

>>>>>>> 885aa4e (feat: init project)
    res.send('Datos recibidos correctamente.');
});

app.listen(3000, function () {
  console.log('Servidor escuchando en el puerto 3000.');
<<<<<<< HEAD
});
=======
});
>>>>>>> 885aa4e (feat: init project)
