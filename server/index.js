const express = require('express');
const app = express();


app.post('/', function (req, res) {
    res.send('Datos recibidos correctamente.');
});

app.listen(3000, function () {
  console.log('Servidor escuchando en el puerto 3000.');
});