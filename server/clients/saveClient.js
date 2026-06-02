import executeQuery from '../sql/sqlUtils.js';



const save = async (booking_id, customer) => {

    const customers = await executeQuery('SELECT customer_id FROM casademiranda.customers WHERE identifier=?', [customer.numero_documento]);
    let idCustomer = 0;
    if (customers.length == 0) {
        const customerInserted = await executeQuery('INSERT INTO casademiranda.customers (name, surname, surname2, identifier, email, nacionality, document_type, support_document, expedition_date, gender, relationship, birthdate, phone, other_phone, made_booking) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0);',
            [customer.nombre, customer.apellido1, customer.apellido2 ?? null, customer.numero_documento, customer.correo, customer.nacionalidad, customer.tipo_documento, customer.soporte_documento, customer.fecha_expedicion.split("T")[0], customer.genero, customer.parentesco, customer.fecha_nacimiento.split("T")[0], customer.telefono, customer.otro_telefono]);
        idCustomer = customerInserted.insertId;
    } else if (customers.length > 1) {
        throw new Error('Only one customer for identifier');
    } else {
        idCustomer = customers[0].customer_id;
    }

    const idBooking = await executeQuery('SELECT booking_id FROM casademiranda.bookings WHERE booking_id = ?;', [booking_id]);
    const idBookingCustomer = await executeQuery('INSERT INTO casademiranda.booking_customer (booking_id, customer_id) VALUES (?, ?)', [idBooking[0].booking_id, idCustomer])
    const addressInserted = await executeQuery('INSERT INTO casademiranda.address (line, line2, country, province, location, postalCode) VALUES (?, ?, ?, ?, ?, ?)',[customer.direccion.line, customer.direccion.line2, customer.direccion.country, customer.direccion.province, customer.direccion.location, customer.direccion.postalCode])
    if(addressInserted.insertId !== null){
        const idCustomerAddress = await executeQuery('INSERT INTO casademiranda.customer_address (address_id, customer_id) VALUES (?, ?)', [addressInserted.insertId, idCustomer]);
    }

    return idCustomer;
}

const update = async (booking_id, customer) => {

    console.log('Cliente:', JSON.stringify(customer));
    const customers = await executeQuery('SELECT customer_id FROM casademiranda.customers WHERE customer_id=?', [customer.cliente_id]);
    console.log('Cliente bbdd:', JSON.stringify(customers));

    const idBooking = await executeQuery('SELECT customer_id,booking_id FROM casademiranda.booking_customer WHERE booking_id = ? AND customer_id = ?;', [booking_id, customer.cliente_id]);
    let customerUpdate;
    if (customers.length === 1 && idBooking.length === 1 && customers[0].customer_id === idBooking[0].customer_id) {
        customerUpdate = await executeQuery('UPDATE casademiranda.customers SET name = ?, surname = ?, surname2 = ?, identifier = ?, email = ?, nacionality = ?, document_type = ?, support_document = ?, expedition_date = ?, gender = ?, relationship = ?, birthdate = ?, phone = ?, other_phone = ? WHERE customer_id = ?;',
            [customer.nombre, customer.apellido1, customer.apellido2 ?? null, customer.numero_documento, customer.correo, customer.nacionalidad, customer.tipo_documento, customer.soporte_documento, customer.fecha_expedicion.split("T")[0], customer.genero, customer.parentesco, customer.fecha_nacimiento.split("T")[0], customer.telefono, customer.otro_telefono, customer.cliente_id]);
    
        const idAddress = await executeQuery('SELECT address_id, customer_id FROM casademiranda.customer_address WHERE customer_id=?', [customer.cliente_id]);
        if(customers.length === 1 && idAddress.length === 1 && customers[0].customer_id === idAddress[0].customer_id){
            addressUpdate = await executeQuery('UPDATE casademiranda.address  SET line = ? , line2 = ?, country = ?, province = ?, location = ?, postalCode = ? WHERE address_id = ?;', [customer.direccion.line, customer.direccion.line2, customer.direccion.country, customer.direccion.province, customer.direccion.location, customer.direccion.postalCode, idAddress[0].address_id]);
        }else if(idAddress.length === 0){
            const addressInserted = await executeQuery('INSERT INTO casademiranda.address (line, line2, country, province, location, postalCode) VALUES (?, ?, ?, ?, ?, ?)',[customer.direccion.line, customer.direccion.line2, customer.direccion.country, customer.direccion.province, customer.direccion.location, customer.direccion.postalCode])
            console.log('addressInserted:', JSON.stringify(addressInserted.insertId));
            const idCustomerAddress = await executeQuery('INSERT INTO casademiranda.customer_address (address_id, customer_id) VALUES (?, ?)', [addressInserted.insertId, customer.cliente_id])
        }else {
            throw new Error('Error update address');
        }

    } else if (customers.length > 1) {
        throw new Error('Only one customer for identifier');
    } else {
        throw new Error('Not matched bookingId');
    }

    console.log('CustomerUpdate: ', JSON.stringify(customerUpdate));
    const customerUpdated = await executeQuery('SELECT c.customer_id, name, surname, identifier, email, nacionality, document_type, expedition_date, gender, birthdate, made_booking, b.check_in, a.address_id, a.line, a.line2, a.country, a.province, a.location, a.postalCode FROM casademiranda.customers c INNER JOIN casademiranda.booking_customer bc ON c.customer_id = bc.customer_id INNER JOIN casademiranda.bookings b ON bc.booking_id = b.booking_id INNER JOIN casademiranda.customer_address ca ON c.customer_id = ca.customer_id INNER JOIN casademiranda.address a ON ca.address_id = a.address_id WHERE c.customer_id=?;', [customer.cliente_id]);
    if (customerUpdated.length > 1) {
        throw new Error('Only one customer for id');
    }
    return customerUpdated[0];
}

export {save, update};