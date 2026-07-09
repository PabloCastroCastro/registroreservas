import executeQuery from '../sql/sqlUtils.js';

export async function listSuppliers() {
    const rows = await executeQuery(
        'SELECT id, name, domain, subject_keyword AS subjectKeyword FROM casademiranda.suppliers ORDER BY name'
    );
    return rows ?? [];
}

export async function findSupplierByDomain(domain, excludeId = null) {
    const rows = excludeId
        ? await executeQuery('SELECT id FROM casademiranda.suppliers WHERE domain = ? AND id != ?', [domain, excludeId])
        : await executeQuery('SELECT id FROM casademiranda.suppliers WHERE domain = ?', [domain]);
    return rows?.[0] ?? null;
}

export async function createSupplier(name, domain, subjectKeyword) {
    const result = await executeQuery(
        'INSERT INTO casademiranda.suppliers (name, domain, subject_keyword) VALUES (?, ?, ?)',
        [name, domain, subjectKeyword ?? null]
    );
    return result.insertId;
}

export async function updateSupplier(id, name, domain, subjectKeyword) {
    await executeQuery(
        'UPDATE casademiranda.suppliers SET name = ?, domain = ?, subject_keyword = ? WHERE id = ?',
        [name, domain, subjectKeyword ?? null, id]
    );
}

export async function deleteSupplier(id) {
    await executeQuery('DELETE FROM casademiranda.suppliers WHERE id = ?', [id]);
}
