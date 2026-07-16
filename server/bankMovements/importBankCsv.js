import executeQuery from '../sql/sqlUtils.js';

const DATE_RE = /^(\d{2})-(\d{2})-(\d{4})$/;

function decodeBuffer(buffer) {
    const utf8 = buffer.toString('utf8');
    if (!utf8.includes('�')) return utf8;
    return buffer.toString('latin1');
}

function parseAmount(raw) {
    if (!raw) return null;
    const cleaned = raw.replace(/EUR/i, '').trim().replace(',', '.');
    const value = Number(cleaned);
    return Number.isFinite(value) ? value : null;
}

function parseDate(raw) {
    const match = DATE_RE.exec((raw ?? '').trim());
    if (!match) return null;
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
}

export function parseBankCsv(buffer) {
    const text = decodeBuffer(buffer);
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    const movements = [];

    for (const line of lines.slice(1)) {
        const columns = line.split(';');
        if (columns.length < 4) continue;

        const date = parseDate(columns[0]);
        const description = (columns[1] ?? '').trim();
        const saldo = (columns[2] ?? '').trim();
        const amount = parseAmount(columns[3]);
        if (!date || !description || amount === null) continue;

        movements.push({
            date,
            type: amount < 0 ? 'gasto' : 'ingreso',
            description,
            amount: Math.abs(amount),
            notes: saldo ? `Saldo tras operación: ${saldo}` : null,
        });
    }

    return movements;
}

export async function markDuplicates(movements) {
    if (movements.length === 0) return movements;

    const dates = movements.map(m => m.date);
    const minDate = dates.reduce((a, b) => (a < b ? a : b));
    const maxDate = dates.reduce((a, b) => (a > b ? a : b));

    const existing = await executeQuery(
        `SELECT date, type, description, amount
         FROM casademiranda.bank_movements
         WHERE date BETWEEN ? AND ?`,
        [minDate, maxDate]
    );

    const key = (date, type, description, amount) =>
        `${date}|${type}|${description}|${Number(amount).toFixed(2)}`;
    const existingKeys = new Set((existing ?? []).map(row =>
        key(row.date.toISOString().slice(0, 10), row.type, row.description, row.amount)
    ));

    return movements.map(m => ({
        ...m,
        duplicate: existingKeys.has(key(m.date, m.type, m.description, m.amount)),
    }));
}
