import executeQuery from '../sql/sqlUtils.js';
import { getConfirmationNumbersForQuarter } from './listInvoices.js';
import { listSupplierInvoices } from './supplierInvoices.js';
import { listBankMovements } from '../bankMovements/bankMovements.js';

export async function getClienteDetalle(year, quarter) {
    const confirmationNumbers = getConfirmationNumbersForQuarter(year, quarter);
    if (confirmationNumbers.length === 0) return [];

    const rows = await executeQuery(
        `SELECT b.confirmation_number, b.check_in, b.check_out, r.name AS roomName,
                br.price, brex.number_bed, brex.price_bed
         FROM bookings b
         INNER JOIN booking_room br ON br.booking_id = b.booking_id
         INNER JOIN rooms r ON br.room_id = r.room_id
         LEFT JOIN booking_room_extra_bed brex ON brex.booking_room_id = br.booking_room_id
         WHERE b.confirmation_number IN (?)
         ORDER BY b.confirmation_number, br.booking_room_id`,
        [confirmationNumbers]
    );

    return (rows ?? []).map(row => {
        const nights = Math.round((new Date(row.check_out) - new Date(row.check_in)) / 86400000);
        const roomPrice = Number(row.price ?? 0);
        const extraBedCount = row.number_bed ?? null;
        const extraBedPrice = row.price_bed != null ? Number(row.price_bed) : null;
        const roomTotal = nights * roomPrice;
        const extraBedTotal = extraBedPrice != null ? nights * (extraBedCount ?? 1) * extraBedPrice : 0;
        return {
            confirmationNumber: row.confirmation_number,
            checkOut: row.check_out,
            nights,
            roomName: row.roomName,
            roomPrice,
            extraBedCount,
            extraBedPrice,
            total: roomTotal + extraBedTotal,
        };
    });
}

export async function getProveedorDetalle(year, quarter) {
    const invoices = await listSupplierInvoices(year, quarter);
    return invoices.map(inv => ({
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        totalAmount: inv.totalAmount,
        supplierName: inv.supplierName,
        notes: inv.notes,
    }));
}

export async function getBankMovementDetalle(year, quarter) {
    return listBankMovements(year, quarter);
}

export async function getInformeResumen(year, quarter) {
    const [clientes, proveedores, movimientos] = await Promise.all([
        getClienteDetalle(year, quarter),
        getProveedorDetalle(year, quarter),
        getBankMovementDetalle(year, quarter),
    ]);
    const ingresosFacturas = clientes.reduce((sum, c) => sum + c.total, 0);
    const gastosFacturas = proveedores.reduce((sum, p) => sum + p.totalAmount, 0);
    const ingresosBanco = movimientos.filter(m => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);
    const gastosBanco = movimientos.filter(m => m.type === 'gasto').reduce((sum, m) => sum + m.amount, 0);
    return {
        ingresosFacturas,
        gastosFacturas,
        ingresosBanco,
        gastosBanco,
        resultado: ingresosFacturas + ingresosBanco - gastosFacturas - gastosBanco,
        clientes,
        proveedores,
        movimientos,
    };
}
