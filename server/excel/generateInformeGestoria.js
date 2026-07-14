import ExcelJS from 'exceljs';
import { getClienteDetalle, getProveedorDetalle } from '../invoices/informeGestoria.js';

export async function generateInformeExcel(year, quarter) {
    const [clientes, proveedores] = await Promise.all([
        getClienteDetalle(year, quarter),
        getProveedorDetalle(year, quarter),
    ]);

    const workbook = new ExcelJS.Workbook();

    const clientesSheet = workbook.addWorksheet('Clientes');
    clientesSheet.columns = [
        { header: 'Identificador reserva', key: 'confirmationNumber', width: 18 },
        { header: 'Fecha checkout', key: 'checkOut', width: 14 },
        { header: 'Número noches', key: 'nights', width: 14 },
        { header: 'Precio habitación', key: 'roomPrice', width: 16 },
        { header: 'Supletorias', key: 'extraBedCount', width: 12 },
        { header: 'Precio Supletoria', key: 'extraBedPrice', width: 16 },
        { header: 'Total', key: 'total', width: 12 },
        { header: 'Observaciones', key: 'observaciones', width: 24 },
    ];
    clientes.forEach(c => clientesSheet.addRow({
        confirmationNumber: c.confirmationNumber,
        checkOut: new Date(c.checkOut).toLocaleDateString('es-ES'),
        nights: c.nights,
        roomPrice: c.roomPrice,
        extraBedCount: c.extraBedCount ?? '',
        extraBedPrice: c.extraBedPrice ?? '',
        total: c.total,
        observaciones: '',
    }));

    const proveedoresSheet = workbook.addWorksheet('Proveedores');
    proveedoresSheet.columns = [
        { header: 'Número factura', key: 'invoiceNumber', width: 18 },
        { header: 'Fecha', key: 'date', width: 14 },
        { header: 'Importe total', key: 'totalAmount', width: 14 },
        { header: 'Beneficiario', key: 'supplierName', width: 30 },
        { header: 'Observaciones', key: 'notes', width: 24 },
    ];
    proveedores.forEach(p => proveedoresSheet.addRow({
        invoiceNumber: p.invoiceNumber ?? '',
        date: new Date(p.date).toLocaleDateString('es-ES'),
        totalAmount: p.totalAmount,
        supplierName: p.supplierName,
        notes: p.notes ?? '',
    }));

    return workbook.xlsx.writeBuffer();
}
