import executeQuery from '../sql/sqlUtils.js';


const listAllCustomers = async (limit) => {
    const query = "SELECT c.customer_id, name, surname, identifier, email, nacionality, document_type, expedition_date, gender, birthdate, made_booking, b.check_in, a.address_id, a.line, a.line2, a.country, a.province, a.location, a.postalCode FROM casademiranda.customers c INNER JOIN casademiranda.booking_customer bc ON c.customer_id = bc.customer_id INNER JOIN casademiranda.bookings b ON bc.booking_id = b.booking_id INNER JOIN casademiranda.customer_address ca ON c.customer_id = ca.customer_id INNER JOIN casademiranda.address a ON ca.address_id = a.address_id;";
    return new Promise((resolve, reject) => {
        executeQuery(query).then((result, error) => {
            if (error) reject(error);
            resolve(result)
        })
    })
}

const listCustomerById = async (customer_id) => {
    return new Promise((resolve, reject) => {
        executeQuery('SELECT c.customer_id, name, surname, identifier, email, nacionality, document_type, expedition_date, gender, birthdate, made_booking, b.check_in, a.address_id, a.line, a.line2, a.country, a.province, a.location, a.postalCode FROM casademiranda.customers c INNER JOIN casademiranda.booking_customer bc ON c.customer_id = bc.customer_id INNER JOIN casademiranda.bookings b ON bc.booking_id = b.booking_id INNER JOIN casademiranda.customer_address ca ON c.customer_id = ca.customer_id INNER JOIN casademiranda.address a ON ca.address_id = a.address_id WHERE c.customer_id=?;', [customer_id]).then((result, error) => {
            if (error) reject(error);
            if(result.length > 1) reject("Only one client for id");
            resolve(result[0]);
        })
    })
}

const listCustomerByBookingId = async (booking_id) => {
    return new Promise((resolve, reject) => {
        executeQuery('SELECT c.customer_id, name, surname, identifier, email, nacionality, document_type, expedition_date, gender, birthdate, made_booking, b.check_in, a.address_id, a.line, a.line2, a.country, a.province, a.location, a.postalCode FROM casademiranda.customers c INNER JOIN casademiranda.booking_customer bc ON c.customer_id = bc.customer_id INNER JOIN casademiranda.bookings b ON bc.booking_id = b.booking_id INNER JOIN casademiranda.customer_address ca ON c.customer_id = ca.customer_id INNER JOIN casademiranda.address a ON ca.address_id = a.address_id WHERE bc.booking_id=?;', [booking_id]).then((result, error) => {
            if (error) reject(error);
            resolve(result)
        })
    })
}

const listCustomerByIdentifier = async (identifier) => {
    return new Promise((resolve, reject) => {
        executeQuery('SELECT c.customer_id, name, surname, identifier, email, nacionality, document_type, expedition_date, gender, birthdate, made_booking, b.check_in, a.address_id, a.line, a.line2, a.country, a.province, a.location, a.postalCode FROM casademiranda.customers c INNER JOIN casademiranda.booking_customer bc ON c.customer_id = bc.customer_id INNER JOIN casademiranda.bookings b ON bc.booking_id = b.booking_id INNER JOIN casademiranda.customer_address ca ON c.customer_id = ca.customer_id INNER JOIN casademiranda.address a ON ca.address_id = a.address_id WHERE identifier=?;', [identifier]).then((result, error) => {
            if (error) reject(error);
            resolve(result)
        })
    })
}


export { listAllCustomers, listCustomerById, listCustomerByBookingId, listCustomerByIdentifier};


