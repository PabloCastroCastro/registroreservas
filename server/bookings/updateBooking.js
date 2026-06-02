import executeQuery from '../sql/sqlUtils.js';

const updateBookingById = async (bookingId, booking) => {
    await executeQuery(
        'UPDATE casademiranda.bookings SET check_in = ?, check_out = ?, payment_type = ?, other_platform_reference = ? WHERE booking_id = ?',
        [booking.checkInDate, booking.checkOutDate, booking.tipo_pago, booking.referenciaOtraPlataforma ?? null, bookingId]
    );

    const customers = await executeQuery(
        'SELECT customer_id FROM casademiranda.booking_customer WHERE booking_id = ?',
        [bookingId]
    );

    if (customers.length > 0) {
        await executeQuery(
            'UPDATE casademiranda.customers SET name = ?, surname = ?, identifier = ? WHERE customer_id = ?',
            [booking.nombre, booking.apellidos, booking.dni, customers[0].customer_id]
        );
    }
};

export default updateBookingById;
