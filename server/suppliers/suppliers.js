import executeQuery from '../sql/sqlUtils.js';

const SELECT_FIELDS = `id, name, domain, subject_keyword AS subjectKeyword,
    invoice_number_pattern AS invoiceNumberPattern,
    nif_pattern AS nifPattern,
    base_amount_pattern AS baseAmountPattern,
    vat_rate_pattern AS vatRatePattern,
    total_amount_pattern AS totalAmountPattern`;

export async function listSuppliers() {
    const rows = await executeQuery(
        `SELECT ${SELECT_FIELDS} FROM casademiranda.suppliers ORDER BY name`
    );
    return rows ?? [];
}

export async function getSupplierById(id) {
    const rows = await executeQuery(
        `SELECT ${SELECT_FIELDS} FROM casademiranda.suppliers WHERE id = ?`,
        [id]
    );
    return rows?.[0] ?? null;
}

export async function findSupplierByDomain(domain, excludeId = null) {
    const rows = excludeId
        ? await executeQuery('SELECT id FROM casademiranda.suppliers WHERE domain = ? AND id != ?', [domain, excludeId])
        : await executeQuery('SELECT id FROM casademiranda.suppliers WHERE domain = ?', [domain]);
    return rows?.[0] ?? null;
}

export async function createSupplier(name, domain, subjectKeyword, template = {}) {
    const result = await executeQuery(
        `INSERT INTO casademiranda.suppliers
            (name, domain, subject_keyword, invoice_number_pattern, nif_pattern, base_amount_pattern, vat_rate_pattern, total_amount_pattern)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name, domain, subjectKeyword ?? null,
            template.invoiceNumberPattern ?? null,
            template.nifPattern ?? null,
            template.baseAmountPattern ?? null,
            template.vatRatePattern ?? null,
            template.totalAmountPattern ?? null,
        ]
    );
    return result.insertId;
}

export async function updateSupplier(id, name, domain, subjectKeyword, template = {}) {
    await executeQuery(
        `UPDATE casademiranda.suppliers
         SET name = ?, domain = ?, subject_keyword = ?,
             invoice_number_pattern = ?, nif_pattern = ?, base_amount_pattern = ?, vat_rate_pattern = ?, total_amount_pattern = ?
         WHERE id = ?`,
        [
            name, domain, subjectKeyword ?? null,
            template.invoiceNumberPattern ?? null,
            template.nifPattern ?? null,
            template.baseAmountPattern ?? null,
            template.vatRatePattern ?? null,
            template.totalAmountPattern ?? null,
            id,
        ]
    );
}

export async function deleteSupplier(id) {
    await executeQuery('DELETE FROM casademiranda.suppliers WHERE id = ?', [id]);
}
