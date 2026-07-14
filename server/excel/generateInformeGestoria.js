import ExcelJS from 'exceljs';
import { getClienteDetalle, getProveedorDetalle } from '../invoices/informeGestoria.js';

const CURRENCY_FORMAT = '#,##0.00" €"';
const GRAY_FILL = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E8E8' } };
const THIN_LINE = { style: 'thin', color: { argb: 'FFB0B0B0' } };
const CELL_BORDER = { top: THIN_LINE, left: THIN_LINE, bottom: THIN_LINE, right: THIN_LINE };

function addSectionTitle(sheet, title, columnCount) {
    const row = sheet.addRow([title]);
    sheet.mergeCells(row.number, 1, row.number, columnCount);
    row.font = { bold: true, size: 12 };
}

function addHeaderRow(sheet, headers) {
    const row = sheet.addRow(headers);
    row.font = { bold: true };
    row.eachCell(cell => { cell.border = CELL_BORDER; });
    return row;
}

function addDataRows(sheet, items, buildValues, currencyColumns) {
    items.forEach((item, i) => {
        const row = sheet.addRow(buildValues(item));
        const isGray = i % 2 === 0;
        row.eachCell({ includeEmpty: true }, cell => {
            if (isGray) cell.fill = GRAY_FILL;
            cell.border = CELL_BORDER;
        });
        currencyColumns.forEach(col => { row.getCell(col).numFmt = CURRENCY_FORMAT; });
    });
}

export async function generateInformeExcel(year, quarter) {
    const [clientes, proveedores] = await Promise.all([
        getClienteDetalle(year, quarter),
        getProveedorDetalle(year, quarter),
    ]);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('InformeGestoria');

    const COLUMN_COUNT = 8;
    sheet.columns = [
        { width: 18 }, { width: 14 }, { width: 14 }, { width: 16 },
        { width: 12 }, { width: 16 }, { width: 12 }, { width: 24 },
    ];

    addSectionTitle(sheet, 'Clientes', COLUMN_COUNT);
    addHeaderRow(sheet, [
        'Identificador reserva', 'Fecha checkout', 'Número noches', 'Precio habitación',
        'Supletorias', 'Precio Supletoria', 'Total', 'Observaciones',
    ]);
    addDataRows(sheet, clientes, c => [
        c.confirmationNumber,
        new Date(c.checkOut).toLocaleDateString('es-ES'),
        c.nights,
        c.roomPrice,
        c.extraBedCount ?? '',
        c.extraBedPrice ?? '',
        c.total,
        '',
    ], [4, 6, 7]);

    sheet.addRow([]);

    addSectionTitle(sheet, 'Proveedores', COLUMN_COUNT);
    addHeaderRow(sheet, ['Número factura', 'Fecha', 'Importe total', 'Beneficiario', 'Observaciones']);
    addDataRows(sheet, proveedores, p => [
        p.invoiceNumber ?? '',
        new Date(p.date).toLocaleDateString('es-ES'),
        p.totalAmount,
        p.supplierName,
        p.notes ?? '',
    ], [3]);

    sheet.pageSetup = {
        orientation: 'landscape',
        fitToPage: true,
        fitToWidth: 1,
        fitToHeight: 1,
        margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 },
    };

    return workbook.xlsx.writeBuffer();
}
