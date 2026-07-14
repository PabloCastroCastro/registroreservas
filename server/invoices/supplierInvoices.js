import executeQuery from '../sql/sqlUtils.js';

function quarterRange(year, quarter) {
    const y = Number(year);
    const q = Number(quarter);
    const startMonth = (q - 1) * 3 + 1;
    const startDate = `${y}-${String(startMonth).padStart(2, '0')}-01`;
    const endDate = new Date(y, startMonth + 2, 0).toISOString().slice(0, 10);
    return { startDate, endDate };
}

async function insertVatLines(invoiceId, vatLines) {
    if (!vatLines || vatLines.length === 0) return;
    const values = vatLines.map(l => [invoiceId, l.baseAmount, l.vatRate, Number((l.baseAmount * l.vatRate).toFixed(2))]);
    await executeQuery(
        `INSERT INTO casademiranda.supplier_invoice_vat_lines (supplier_invoice_id, base_amount, vat_rate, vat_amount) VALUES ?`,
        [values]
    );
}

async function getVatLinesByInvoiceIds(ids) {
    if (!ids || ids.length === 0) return new Map();
    const rows = await executeQuery(
        `SELECT supplier_invoice_id AS supplierInvoiceId, base_amount AS baseAmount, vat_rate AS vatRate, vat_amount AS vatAmount
         FROM casademiranda.supplier_invoice_vat_lines
         WHERE supplier_invoice_id IN (?)`,
        [ids]
    );
    const byInvoice = new Map();
    for (const row of rows ?? []) {
        const list = byInvoice.get(row.supplierInvoiceId) ?? [];
        list.push({
            baseAmount: Number(row.baseAmount),
            vatRate: Number(row.vatRate),
            vatAmount: Number(row.vatAmount),
        });
        byInvoice.set(row.supplierInvoiceId, list);
    }
    return byInvoice;
}

export async function listSupplierInvoices(year, quarter) {
    const { startDate, endDate } = quarterRange(year, quarter);
    const invoices = await executeQuery(
        `SELECT id, invoice_number AS invoiceNumber, nif, date, supplier_name AS supplierName,
                total_amount AS totalAmount, reference, notes, file_path AS filePath
         FROM casademiranda.supplier_invoices
         WHERE date BETWEEN ? AND ?
         ORDER BY date, id`,
        [startDate, endDate]
    );
    const linesByInvoice = await getVatLinesByInvoiceIds((invoices ?? []).map(i => i.id));
    return (invoices ?? []).map(row => ({
        ...row,
        totalAmount: Number(row.totalAmount),
        vatLines: linesByInvoice.get(row.id) ?? [],
    }));
}

export async function getSupplierInvoiceFilePath(id) {
    const rows = await executeQuery(
        'SELECT file_path AS filePath FROM casademiranda.supplier_invoices WHERE id = ?',
        [id]
    );
    return rows?.[0]?.filePath ?? null;
}

export async function setSupplierInvoiceFilePath(id, filePath) {
    await executeQuery(
        'UPDATE casademiranda.supplier_invoices SET file_path = ? WHERE id = ?',
        [filePath, id]
    );
}

export async function listRegisteredEmailUids() {
    const rows = await executeQuery(
        'SELECT email_uid FROM casademiranda.supplier_invoices WHERE email_uid IS NOT NULL'
    );
    return (rows ?? []).map(r => r.email_uid);
}

export async function createSupplierInvoice(data) {
    const { invoiceNumber, nif, date, supplierName, totalAmount, reference, notes, emailUid, vatLines } = data;
    const result = await executeQuery(
        `INSERT INTO casademiranda.supplier_invoices
            (invoice_number, nif, date, supplier_name, total_amount, reference, notes, email_uid)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoiceNumber ?? null, nif ?? null, date, supplierName, totalAmount,
         reference ?? null, notes ?? null, emailUid ?? null]
    );
    const id = result.insertId;
    await insertVatLines(id, vatLines);
    return id;
}

export async function updateSupplierInvoice(id, data) {
    const { invoiceNumber, nif, date, supplierName, totalAmount, reference, notes, vatLines } = data;
    await executeQuery(
        `UPDATE casademiranda.supplier_invoices
         SET invoice_number = ?, nif = ?, date = ?, supplier_name = ?, total_amount = ?, reference = ?, notes = ?
         WHERE id = ?`,
        [invoiceNumber ?? null, nif ?? null, date, supplierName, totalAmount,
         reference ?? null, notes ?? null, id]
    );
    await executeQuery('DELETE FROM casademiranda.supplier_invoice_vat_lines WHERE supplier_invoice_id = ?', [id]);
    await insertVatLines(id, vatLines);
}

export async function deleteSupplierInvoice(id) {
    await executeQuery('DELETE FROM casademiranda.supplier_invoices WHERE id = ?', [id]);
}
