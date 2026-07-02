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

    if (Array.isArray(booking.habitaciones) && booking.habitaciones.length > 0) {
        const existingRooms = await executeQuery(
            'SELECT booking_room_id FROM casademiranda.booking_room WHERE booking_id = ?',
            [bookingId]
        );
        for (const room of existingRooms) {
            await executeQuery(
                'DELETE FROM casademiranda.booking_room_extra_bed WHERE booking_room_id = ?',
                [room.booking_room_id]
            );
        }
        await executeQuery('DELETE FROM casademiranda.booking_room WHERE booking_id = ?', [bookingId]);

        for (const room of booking.habitaciones) {
            const idRoom = await executeQuery('SELECT room_id FROM casademiranda.rooms WHERE name = ?', [room.habitacion]);
            if (!idRoom.length) throw new Error(`Room not found: ${room.habitacion}`);
            const inserted = await executeQuery(
                'INSERT INTO casademiranda.booking_room (booking_id, room_id, price) VALUES (?, ?, ?)',
                [bookingId, idRoom[0].room_id, room.precio]
            );
            if (room.supletorias > 0) {
                await executeQuery(
                    'INSERT INTO casademiranda.booking_room_extra_bed (booking_room_id, number_bed, price_bed) VALUES (?, ?, ?)',
                    [inserted.insertId, room.supletorias, room.precioSupletoria]
                );
            }
        }
    }
};

export default updateBookingById;
