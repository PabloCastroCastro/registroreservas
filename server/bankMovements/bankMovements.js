import executeQuery from '../sql/sqlUtils.js';

function quarterRange(year, quarter) {
    const y = Number(year);
    const q = Number(quarter);
    const startMonth = (q - 1) * 3 + 1;
    const startDate = `${y}-${String(startMonth).padStart(2, '0')}-01`;
    const endDate = new Date(y, startMonth + 2, 0).toISOString().slice(0, 10);
    return { startDate, endDate };
}

export async function listBankMovements(year, quarter) {
    const { startDate, endDate } = quarterRange(year, quarter);
    const rows = await executeQuery(
        `SELECT id, date, type, description, amount, notes
         FROM casademiranda.bank_movements
         WHERE date BETWEEN ? AND ?
         ORDER BY date, id`,
        [startDate, endDate]
    );
    return (rows ?? []).map(row => ({ ...row, amount: Number(row.amount) }));
}

export async function createBankMovement(data) {
    const { date, type, description, amount, notes } = data;
    const result = await executeQuery(
        `INSERT INTO casademiranda.bank_movements (date, type, description, amount, notes)
         VALUES (?, ?, ?, ?, ?)`,
        [date, type, description, amount, notes ?? null]
    );
    return result.insertId;
}

export async function updateBankMovement(id, data) {
    const { date, type, description, amount, notes } = data;
    await executeQuery(
        `UPDATE casademiranda.bank_movements
         SET date = ?, type = ?, description = ?, amount = ?, notes = ?
         WHERE id = ?`,
        [date, type, description, amount, notes ?? null, id]
    );
}

export async function deleteBankMovement(id) {
    await executeQuery('DELETE FROM casademiranda.bank_movements WHERE id = ?', [id]);
}
