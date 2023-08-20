const sql = require('../sql/sqlUtils')


const listAllCustomers = async (limit) => {
    const query = "SELECT c.customer_id, name, surname, identifier, email, nacionality, document_type, expedition_date, gender, birthdate, made_booking, b.check_in FROM casademiranda.customers c INNER JOIN casademiranda.booking_customer bc ON c.customer_id = bc.customer_id INNER JOIN casademiranda.bookings b ON bc.booking_id = b.booking_id;";
    return new Promise((resolve, reject) => {
        sql.executeQuery(query).then((result, error) => {
            if (error) reject(error);
            resolve(result)
        })
    })
}

const listCustomerById = async (customer_id) => {
    return new Promise((resolve, reject) => {
        sql.executeQuery('SELECT c.customer_id, name, surname, identifier, email, nacionality, document_type, expedition_date, gender, birthdate, made_booking, b.check_in FROM casademiranda.customers c INNER JOIN casademiranda.booking_customer bc ON c.customer_id = bc.customer_id INNER JOIN casademiranda.bookings b ON bc.booking_id = b.booking_id WHERE c.customer_id=?;', [customer_id]).then((result, error) => {
            if (error) reject(error);
            if(result.length > 1) reject("Only one client for id");
            resolve(result[0]);
        })
    })
}

const listCustomerByBookingId = async (booking_id) => {
    return new Promise((resolve, reject) => {
        sql.executeQuery('SELECT c.customer_id, name, surname, identifier, email, nacionality, document_type, expedition_date, gender, birthdate, made_booking, b.check_in FROM casademiranda.customers c INNER JOIN casademiranda.booking_customer bc ON c.customer_id = bc.customer_id INNER JOIN casademiranda.bookings b ON bc.booking_id = b.booking_id WHERE bc.booking_id=?;', [booking_id]).then((result, error) => {
            if (error) reject(error);
            resolve(result)
        })
    })
}

const listCustomerByIdentifier = async (identifier) => {
    return new Promise((resolve, reject) => {
        sql.executeQuery('SELECT c.customer_id, name, surname, identifier, email, nacionality, document_type, expedition_date, gender, birthdate, made_booking, b.check_in FROM casademiranda.customers c INNER JOIN casademiranda.booking_customer bc ON c.customer_id = bc.customer_id INNER JOIN casademiranda.bookings b ON bc.booking_id = b.booking_id WHERE identifier=?;', [identifier]).then((result, error) => {
            if (error) reject(error);
            resolve(result)
        })
    })
}


module.exports = {
    listAllCustomers: listAllCustomers,
    listCustomerById: listCustomerById,
    listCustomerByBookingId: listCustomerByBookingId,
    listCustomerByIdentifier: listCustomerByIdentifier
};


