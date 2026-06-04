import executeQuery from '../sql/sqlUtils.js';

export async function checkRoomAvailability(roomName, checkIn, checkOut, excludeBookingId = null) {
    let query = `
        SELECT COUNT(*) as cnt
        FROM casademiranda.bookings b
        JOIN casademiranda.booking_room br ON b.booking_id = br.booking_id
        JOIN casademiranda.rooms r ON br.room_id = r.room_id
        WHERE r.name = ?
          AND b.state NOT IN ('cancelada', 'cancelled_by_guest')
          AND b.check_in < ? AND b.check_out > ?
    `;
    const params = [roomName, checkOut, checkIn];

    if (excludeBookingId) {
        query += ' AND b.booking_id != ?';
        params.push(excludeBookingId);
    }

    const result = await executeQuery(query, params);
    return result[0].cnt === 0;
}
