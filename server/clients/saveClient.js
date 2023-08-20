const sql = require('../sql/sqlUtils')



const save = async (booking_id, customer) => {

    const customers = await sql.executeQuery('SELECT customer_id FROM casademiranda.customers WHERE identifier=?', [customer.numero_documento]);
    let idCustomer = 0;
    if (customers.length == 0) {
        const customerInserted = await sql.executeQuery('INSERT INTO casademiranda.customers (name, surname, identifier, email, nacionality, document_type, expedition_date, gender, birthdate,made_booking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0);',
            [customer.nombre, customer.apellidos, customer.numero_documento, customer.email, customer.nacionalidad, customer.tipo_documento, customer.fecha_expedicion.split("T")[0], customer.genero, customer.fecha_nacimiento.split("T")[0]]);
        idCustomer = customerInserted.insertId;
    } else if (customers.length > 1) {
        throw new Error('Only one customer for identifier');
    } else {
        idCustomer = customers[0].customer_id;
    }

    const idBooking = await sql.executeQuery('SELECT booking_id FROM casademiranda.bookings WHERE booking_id = ?;', [booking_id]);
    const idBookingCustomer = await sql.executeQuery('INSERT INTO casademiranda.booking_customer (booking_id, customer_id) VALUES (?, ?)', [idBooking[0].booking_id, idCustomer])
    return idCustomer;
}

const update = async (booking_id, customer) => {


    const customers = await sql.executeQuery('SELECT customer_id FROM casademiranda.customers WHERE customer_id=?', [customer.cliente_id]);
    const idBooking = await sql.executeQuery('SELECT customer_id,booking_id FROM casademiranda.booking_customer WHERE booking_id = ? AND customer_id = ?;', [booking_id, customer.cliente_id]);
    let customerUpdate;
    if (customers.length === 1 && idBooking.length === 1 && customers[0].customer_id === idBooking[0].customer_id) {
        customerUpdate = await sql.executeQuery('UPDATE casademiranda.customers  SET name = ? , surname = ?, identifier = ?, email = ?, nacionality = ?, document_type = ?, expedition_date = ?, gender = ?, birthdate = ? WHERE customer_id = ?;',
            [customer.nombre, customer.apellidos, customer.numero_documento, customer.email, customer.nacionalidad, customer.tipo_documento, customer.fecha_expedicion.split("T")[0], customer.genero, customer.fecha_nacimiento.split("T")[0], customer.cliente_id]);
    } else if (customers.length > 1) {
        throw new Error('Only one customer for identifier');
    } else {
        throw new Error('Not matched bookingId');
    }

    console.log('CustomerUpdate: ', JSON.stringify(customerUpdate));
    const customerUpdated = await sql.executeQuery('SELECT c.customer_id, name, surname, identifier, email, nacionality, document_type, expedition_date, gender, birthdate, made_booking, b.check_in FROM casademiranda.customers c INNER JOIN casademiranda.booking_customer bc ON c.customer_id = bc.customer_id INNER JOIN casademiranda.bookings b ON bc.booking_id = b.booking_id WHERE c.customer_id=?;', [customer.cliente_id]);
    if (customerUpdated.length > 1) {
        throw new Error('Only one customer for id');
    }
    return customerUpdated[0];
}

module.exports = {
    save: save,
    update: update
};