import executeQuery from '../sql/sqlUtils.js';

function quarterRange(year, quarter) {
    const y = Number(year);
    const q = Number(quarter);
    const startMonth = (q - 1) * 3 + 1;
    const startDate = `${y}-${String(startMonth).padStart(2, '0')}-01`;
    const endDate = new Date(y, startMonth + 2, 0).toISOString().slice(0, 10);
    return { startDate, endDate };
}

export async function listSupplierInvoices(year, quarter) {
    const { startDate, endDate } = quarterRange(year, quarter);
    const rows = await executeQuery(
        `SELECT id, invoice_number AS invoiceNumber, nif, date, supplier_name AS supplierName,
                base_amount AS baseAmount, vat_rate AS vatRate, vat_amount AS vatAmount,
                total_amount AS totalAmount, reference, notes
         FROM casademiranda.supplier_invoices
         WHERE date BETWEEN ? AND ?
         ORDER BY date, id`,
        [startDate, endDate]
    );
    return rows ?? [];
}

export async function createSupplierInvoice(data) {
    const { invoiceNumber, nif, date, supplierName, baseAmount, vatRate, vatAmount, totalAmount, reference, notes } = data;
    const result = await executeQuery(
        `INSERT INTO casademiranda.supplier_invoices
            (invoice_number, nif, date, supplier_name, base_amount, vat_rate, vat_amount, total_amount, reference, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoiceNumber ?? null, nif ?? null, date, supplierName,
         baseAmount ?? null, vatRate ?? null, vatAmount ?? null, totalAmount,
         reference ?? null, notes ?? null]
    );
    return result.insertId;
}

export async function updateSupplierInvoice(id, data) {
    const { invoiceNumber, nif, date, supplierName, baseAmount, vatRate, vatAmount, totalAmount, reference, notes } = data;
    await executeQuery(
        `UPDATE casademiranda.supplier_invoices
         SET invoice_number = ?, nif = ?, date = ?, supplier_name = ?, base_amount = ?,
             vat_rate = ?, vat_amount = ?, total_amount = ?, reference = ?, notes = ?
         WHERE id = ?`,
        [invoiceNumber ?? null, nif ?? null, date, supplierName,
         baseAmount ?? null, vatRate ?? null, vatAmount ?? null, totalAmount,
         reference ?? null, notes ?? null, id]
    );
}

export async function deleteSupplierInvoice(id) {
    await executeQuery('DELETE FROM casademiranda.supplier_invoices WHERE id = ?', [id]);
}
