import express from 'express';
import multer from 'multer';
import XLSX from 'xlsx';
import { authGuard } from '../middleware/auth.js';
import getInvoiceNumber from '../invoices/getInvoiceNumber.js';
import saveBooking from '../bookings/saveBooking.js';
import executeQuery from '../sql/sqlUtils.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const parseFloatFromText = (str) => typeof str === "string" ? parseFloat(str.replace(/[^\d.-]/g, '')) : str;

const getRoomName = (rowName) => {
    if (!rowName) return '';
    const name = rowName.toLowerCase();
    if (name.includes('carpinteiro')) return 'O Carpinteiro';
    if (name.includes('fonte'))       return 'A Fonte';
    if (name.includes('cuberto'))     return 'O Cuberto';
    if (name.includes('faiado'))      return 'O Faiado';
    return rowName;
};

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

router.post('/upload-booking', upload.single("excelFile"), async function (req, res) {
    if (!authGuard(req, res)) return;

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
        let reservasActualizadas = 0;
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
                const estadoExcel = (row['Estado'] ?? '').toLowerCase().trim();
                const esCancelada = [
                    'cancelled',
                    'canceled',
                    'cancelled_by_guest',
                    'cancelled_by_hotel',
                    'cancelled_by_ota',
                    'no_show',
                ].includes(estadoExcel);

                if (existing.length > 0) {
                    if (esCancelada) {
                        await executeQuery(
                            "UPDATE casademiranda.bookings SET state = 'cancelada' WHERE other_platform_reference = ?",
                            [referencia]
                        );
                        reservasActualizadas++;
                    } else {
                        reservasOmitidas++;
                    }
                } else {
                    await saveBooking(reserva, cliente);
                    reservasCreadas++;
                }
            } catch (err) {
                console.error("Error procesando fila:", row, err);
                errores.push({ referencia, error: err.message });
            }
        }

        await executeQuery(
            'INSERT INTO casademiranda.app_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)',
            ['last_booking_sync', new Date().toISOString()]
        );
        res.json({
            message: "Archivo procesado correctamente",
            reservasCreadas,
            reservasOmitidas,
            reservasActualizadas,
            errores,
        });
    } catch (err) {
        console.error("Error al procesar Excel:", err);
        res.status(500).json({ message: "Error al procesar archivo" });
    }
});

export default router;
