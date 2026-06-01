import executeQuery from '../sql/sqlUtils.js';

const getInvoiceNumber = async (checkOutDate) => {
    const dateKey = new Date(checkOutDate).toISOString().split('T')[0].replace(/-/g, '');
    await executeQuery(
        'INSERT INTO casademiranda.invoice_sequence (date, last_number) VALUES (?, 1) ON DUPLICATE KEY UPDATE last_number = last_number + 1',
        [dateKey]
    );
    const result = await executeQuery(
        'SELECT last_number FROM casademiranda.invoice_sequence WHERE date = ?',
        [dateKey]
    );
    return `${dateKey}${result[0].last_number.toString().padStart(3, '0')}`;
};

export default getInvoiceNumber;
