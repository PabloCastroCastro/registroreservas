import fs from 'fs';
import executeQuery from '../sql/sqlUtils.js';

const FACTURAS_DIR = './facturas-cliente';
const FILENAME_RE = /^(\d{4})(\d{2})(\d{2})\d{3}\.pdf$/;

function quarterOf(month) {
    return Math.ceil(month / 3);
}

export function getConfirmationNumbersForQuarter(year, quarter) {
    const files = fs.readdirSync(FACTURAS_DIR);
    const matched = [];
    for (const file of files) {
        const match = file.match(FILENAME_RE);
        if (!match) continue;
        const [, fileYear, fileMonth] = match;
        if (year && Number(fileYear) !== Number(year)) continue;
        if (quarter && quarterOf(Number(fileMonth)) !== Number(quarter)) continue;
        matched.push(file.replace('.pdf', ''));
    }
    return matched;
}

const listInvoices = async (year, quarter) => {
    const matched = getConfirmationNumbersForQuarter(year, quarter);
    if (matched.length === 0) return [];

    const rows = await executeQuery(
        `SELECT b.confirmation_number, b.check_in, b.check_out, c.name, c.surname,
                br.price, brex.number_bed, brex.price_bed
         FROM bookings b
         INNER JOIN booking_customer bc ON b.booking_id = bc.booking_id
         INNER JOIN customers c ON bc.customer_id = c.customer_id AND c.made_booking = 1
         INNER JOIN booking_room br ON br.booking_id = b.booking_id
         LEFT JOIN booking_room_extra_bed brex ON brex.booking_room_id = br.booking_room_id
         WHERE b.confirmation_number IN (?)`,
        [matched]
    );

    const invoices = new Map();
    for (const row of rows ?? []) {
        let invoice = invoices.get(row.confirmation_number);
        if (!invoice) {
            invoice = {
                confirmationNumber: row.confirmation_number,
                guest: `${row.name} ${row.surname}`,
                checkOut: row.check_out,
                total: 0,
            };
            invoices.set(row.confirmation_number, invoice);
        }
        const nights = Math.round((new Date(row.check_out) - new Date(row.check_in)) / 86400000);
        const roomTotal = nights * Number(row.price ?? 0);
        const extraBedTotal = row.price_bed != null ? nights * (row.number_bed ?? 1) * Number(row.price_bed) : 0;
        invoice.total += roomTotal + extraBedTotal;
    }

    return matched
        .map(number => invoices.get(number))
        .filter(Boolean)
        .sort((a, b) => a.confirmationNumber.localeCompare(b.confirmationNumber));
};

export default listInvoices;
