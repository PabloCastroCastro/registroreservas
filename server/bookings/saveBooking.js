import executeQuery from '../sql/sqlUtils.js';


const save = async (booking, customer) => {

    let customers = [];
    if (customer.dni !== null && customer.dni !== "") {
        customers = await executeQuery('SELECT customer_id FROM casademiranda.customers WHERE identifier=?', [customer.dni]);
    }
    let idCustomer = 0;
    if (customers.length == 0) {
        const customerInserted = await executeQuery('INSERT INTO casademiranda.customers (name, surname, surname2, identifier, email, made_booking) VALUES (?, ?, ?, ?, ?, 1);', [customer.nombre, customer.apellido1 ?? customer.apellidos ?? "", customer.apellido2 ?? null, customer.dni, customer.email]);
        idCustomer = customerInserted.insertId;
    } else if (customers.length > 1) {
        throw new Error('Only one customer for identifier');
    } else {
        idCustomer = customers[0].customer_id;
    }

    let alredyExistBooking = await executeQuery('SELECT booking_id FROM casademiranda.bookings WHERE other_platform_reference =?', [booking.referenciaOtraPlataforma]);
    console.log('AlredyExistBooking', alredyExistBooking);
    if (alredyExistBooking == null || alredyExistBooking.length == 0) {
        const result = await saveBooking(booking, idCustomer);
        return result.insertId;
    } else if (alredyExistBooking.length == 1) {
        await updateBooking(booking, idCustomer);
        return alredyExistBooking[0].booking_id;
    }

}

const saveBooking = async (booking, idCustomer) => {
    const bookingInserted = await executeQuery('INSERT INTO casademiranda.bookings (booking_date, check_in, check_out, state, payment_type, confirmation_number, other_platform_reference) VALUES (?, ?, ?, ?, ?, ?, ?);', [booking.checkOutDate.split("T")[0], booking.checkInDate.split("T")[0], booking.checkOutDate.split("T")[0], booking.estado, booking.tipo_pago, booking.numeroConfirmacion, booking.referenciaOtraPlataforma]);
    const idBookingCustomer = await executeQuery('INSERT INTO casademiranda.booking_customer (booking_id, customer_id) VALUES (?, ?)', [bookingInserted.insertId, idCustomer])
    await saveRoom(booking.habitaciones, bookingInserted.insertId);
    return bookingInserted;
}

const updateBooking = async (booking, idCustomer) => { }

const saveRoom = async (rooms, idBooking) => {

    for (var i = 0; i < rooms.length; i++) {
        const idRoom = await executeQuery('SELECT room_id FROM casademiranda.rooms WHERE name = ?', [rooms[i].habitacion]);
        if (idRoom.length > 1) {
            throw new Error("only one room for name");
        }
        const idBookingRoom = await executeQuery('INSERT INTO casademiranda.booking_room (booking_id, room_id, price) VALUES (?, ?, ?)', [idBooking, idRoom[0].room_id, rooms[i].precio]);
        if (rooms[i].supletorias > 0) {
            executeQuery('INSERT INTO casademiranda.booking_room_extra_bed (booking_room_id, number_bed, price_bed) VALUES (?, ?, ?)', [idBookingRoom.insertId, rooms[i].supletorias, rooms[i].precioSupletoria]);
        }
    }
}

export default save;