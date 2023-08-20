const sql = require('../sql/sqlUtils')



const save = async (booking, customer) => {

    const customers = await sql.executeQuery('SELECT customer_id FROM casademiranda.customers WHERE identifier=?', [customer.dni]);
    let idCustomer = 0;
    if (customers.length == 0) {
        const customerInserted = await sql.executeQuery('INSERT INTO casademiranda.customers (name, surname,identifier,email,made_booking) VALUES (?, ?, ?, ?, 1);', [customer.nombre, customer.apellidos, customer.dni, customer.email]);
        idCustomer = customerInserted.insertId;
    } else if (customers.length > 1) {
        throw new Error('Only one customer for identifier');
    } else {
        idCustomer = customers[0].customer_id;
    }

    const idBooking = await sql.executeQuery('INSERT INTO casademiranda.bookings (check_in, check_out, confirmation_number) VALUES (?, ?, ?);', [booking.checkInDate.split("T")[0], booking.checkOutDate.split("T")[0], booking.numeroConfirmacion]);
    const idBookingCustomer = await sql.executeQuery('INSERT INTO casademiranda.booking_customer (booking_id, customer_id) VALUES (?, ?)', [idBooking.insertId, idCustomer])
    saveRoom(booking.habitaciones, idBooking);
}

const saveRoom = async (rooms, idBooking) => {

    for (var i = 0; i < rooms.length; i++) {
        const idRoom = await sql.executeQuery('SELECT room_id FROM casademiranda.rooms WHERE name = ?', [rooms[i].habitacion]);
        if (idRoom.length > 1) {
            throw new Error("only one room for name");
        }
        const idBookingRoom = await sql.executeQuery('INSERT INTO casademiranda.booking_room (booking_id, room_id, price) VALUES (?, ?, ?)', [idBooking.insertId, idRoom[0].room_id, rooms[i].precio]);
        console.log('BookingId: ', idBookingRoom)
        if (rooms[i].supletorias > 0) {
            sql.executeQuery('INSERT INTO casademiranda.booking_room_extra_bed (booking_room_id, number_bed, price_bed) VALUES (?, ?, ?)', [idBookingRoom.insertId, rooms[i].supletorias, rooms[i].precioSupletoria]);
        }
    }
}

module.exports = {
    save: save,
};