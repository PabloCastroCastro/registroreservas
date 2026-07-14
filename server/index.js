import express from 'express';
import https from 'https';
import fs from 'fs';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import clientesRoutes from './routes/clientes.js';
import reservasRoutes from './routes/reservas.js';
import facturasRoutes from './routes/facturas.js';
import facturasProveedorRoutes from './routes/facturasProveedor.js';
import suppliersRoutes from './routes/suppliers.js';
import menuRoutes from './routes/menu.js';
import preciosRoutes from './routes/precios.js';
import usuariosRoutes from './routes/usuarios.js';
import bookingSyncRoutes from './routes/bookingSync.js';
import uploadBookingRoutes from './routes/uploadBooking.js';
import dniRoutes from './routes/dni.js';
import bankMovementsRoutes from './routes/bankMovements.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', authRoutes);
app.use('/', clientesRoutes);
app.use('/', reservasRoutes);
app.use('/', facturasRoutes);
app.use('/', facturasProveedorRoutes);
app.use('/', suppliersRoutes);
app.use('/', menuRoutes);
app.use('/', preciosRoutes);
app.use('/', usuariosRoutes);
app.use('/', bookingSyncRoutes);
app.use('/', uploadBookingRoutes);
app.use('/', dniRoutes);
app.use('/', bankMovementsRoutes);

app.listen(3003, function () {
    console.log('Servidor escuchando en el puerto 3003.');
});

const options = {
    key: fs.readFileSync('../infrastructure/certs/casademiranda.key', 'utf8'),
    cert: fs.readFileSync('../infrastructure/certs/casademiranda.crt', 'utf8'),
};

// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(443);
