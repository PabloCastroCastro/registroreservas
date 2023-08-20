const sql = require('../sql/sqlUtils')


const listAllBookings = async (limit) => {
    const query = "SELECT b.booking_id, check_in, check_out, c.name, surname, identifier, r.name as room, br.price, number_bed as extra_beds, brex.price_bed FROM bookings b INNER JOIN booking_customer bc ON b.booking_id = bc.booking_id INNER JOIN customers c ON bc.customer_id = c.customer_id AND c.made_booking=1 INNER JOIN booking_room br ON br.booking_id = b.booking_id INNER JOIN rooms r ON br.room_id = r.room_id LEFT JOIN booking_room_extra_bed brex ON brex.booking_room_id=br.booking_room_id;";
    return new Promise((resolve, reject) => {
        sql.executeQuery(query).then((result, error) => {
            if (error) reject(error);
            resolve(processBookings(result))
        })
    })
}

const listBookingById = async (identifier) => {
    return new Promise((resolve, reject) => {
        sql.executeQuery('SELECT b.booking_id, check_in, check_out, c.name, surname, identifier, r.name as room, br.price, number_bed as extra_beds, brex.price_bed FROM bookings b INNER JOIN booking_customer bc ON b.booking_id = bc.booking_id INNER JOIN customers c ON bc.customer_id = c.customer_id AND c.made_booking=1 INNER JOIN booking_room br ON br.booking_id = b.booking_id INNER JOIN rooms r ON br.room_id = r.room_id LEFT JOIN booking_room_extra_bed brex ON brex.booking_room_id=br.booking_room_id WHERE b.booking_id=?', [identifier]).then((result, error) => {
            if (error) reject(error);
            resolve(processBooking(result))
        })
    })
}



const listBookingByCustomer = async (identifier) => {
    return new Promise((resolve, reject) => {
        sql.executeQuery('SELECT b.booking_id, check_in, check_out, c.name, surname, identifier, r.name as room, br.price, number_bed as extra_beds, brex.price_bed FROM bookings b INNER JOIN booking_customer bc ON b.booking_id = bc.booking_id INNER JOIN customers c ON bc.customer_id = c.customer_id AND c.made_booking=1 INNER JOIN booking_room br ON br.booking_id = b.booking_id INNER JOIN rooms r ON br.room_id = r.room_id LEFT JOIN booking_room_extra_bed brex ON brex.booking_room_id=br.booking_room_id WHERE c.identifier=?', [identifier]).then((result, error) => {
            if (error) reject(error);
            resolve(processBookings(result))
        })
    })
}

const processBooking = (bookings) => {

    //codigo duplicado
    const processBookings = [];
    for (i = 0; i < bookings.length; i++) {
        let booking = processBookings.find(o => o.booking_id === bookings[i].booking_id);
        console.log("Booking: ", bookings[i]);
        console.log("Booking find: ", booking);
        if (booking === undefined || booking === null) {
            processBookings.push({
                booking_id: bookings[i].booking_id,
                check_in: bookings[i].check_in,
                check_out: bookings[i].check_out,
                name: bookings[i].name,
                surname: bookings[i].surname,
                identifier: bookings[i].identifier,
                rooms: [{
                    name: bookings[i].room,
                    price: bookings[i].price,
                    extra_beds: bookings[i].extra_beds,
                    price_extra_bed: bookings[i].price_bed
                }]
            })
        } else {
            booking.rooms.push({
                name: bookings[i].room,
                price: bookings[i].price,
                extra_beds: bookings[i].extra_beds,
                price_extra_bed: bookings[i].price_bed
            })
        }
    }

    if (processBookings.length > 1) {
        throw new Error('Only one booking by id')
    } else {
        return processBookings[0];
    }

}


const processBookings = (bookings) => {
    const processBookings = [];
    for (i = 0; i < bookings.length; i++) {
        let booking = processBookings.find(o => o.booking_id === bookings[i].booking_id);
        console.log("Booking: ", bookings[i]);
        console.log("Booking find: ", booking);
        if (booking === undefined || booking === null) {
            processBookings.push({
                booking_id: bookings[i].booking_id,
                check_in: bookings[i].check_in,
                check_out: bookings[i].check_out,
                name: bookings[i].name,
                surname: bookings[i].surname,
                identifier: bookings[i].identifier,
                rooms: [{
                    name: bookings[i].room,
                    price: bookings[i].price,
                    extra_beds: bookings[i].extra_beds,
                    price_extra_bed: bookings[i].price_bed
                }]
            })
        } else {
            booking.rooms.push({
                name: bookings[i].room,
                price: bookings[i].price,
                extra_beds: bookings[i].extra_beds,
                price_extra_bed: bookings[i].price_bed
            })
        }
    }
    console.log("Process booking: ", processBookings);
    return processBookings;
}

module.exports = {
    listAllBookings: listAllBookings,
    listBookingByCustomer: listBookingByCustomer,
    listBookingById: listBookingById
};


