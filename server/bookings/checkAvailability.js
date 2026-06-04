import executeQuery from '../sql/sqlUtils.js';

const ROOMS = ['A Fonte', 'O Carpinteiro', 'O Cuberto', 'O Faiado'];

export async function checkAllRoomsAvailability(checkIn, checkOut, excludeBookingId = null) {
    let query = `
        SELECT r.name as room_name
        FROM casademiranda.bookings b
        JOIN casademiranda.booking_room br ON b.booking_id = br.booking_id
        JOIN casademiranda.rooms r ON br.room_id = r.room_id
        WHERE b.state NOT IN ('cancelada', 'cancelled_by_guest')
          AND b.check_in < ? AND b.check_out > ?
    `;
    const params = [checkOut, checkIn];

    if (excludeBookingId) {
        query += ' AND b.booking_id != ?';
        params.push(excludeBookingId);
    }

    const occupied = await executeQuery(query, params);
    const occupiedNames = new Set((occupied ?? []).map(r => r.room_name));

    const result = {};
    for (const room of ROOMS) {
        result[room] = !occupiedNames.has(room);
    }
    return result;
}
