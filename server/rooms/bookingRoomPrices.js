import executeQuery from '../sql/sqlUtils.js';

export async function listBookingRoomPrices() {
    const rows = await executeQuery(
        'SELECT id, room_name, season, price FROM casademiranda.booking_room_prices ORDER BY room_name, season'
    );
    return rows ?? [];
}

export async function updateBookingRoomPrice(id, price) {
    await executeQuery(
        'UPDATE casademiranda.booking_room_prices SET price = ? WHERE id = ?',
        [price, id]
    );
}

export async function getBookingPriceForRoomAndDate(roomName, date) {
    const config = await executeQuery(
        'SELECT high_season_start, high_season_end FROM casademiranda.season_config LIMIT 1'
    );
    if (!config || config.length === 0) return null;

    const { high_season_start, high_season_end } = config[0];
    const d = new Date(date);
    if (isNaN(d)) return null;
    const mmdd = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const season = (mmdd >= high_season_start && mmdd <= high_season_end) ? 'high' : 'low';

    const rows = await executeQuery(
        'SELECT price FROM casademiranda.booking_room_prices WHERE room_name = ? AND season = ?',
        [roomName, season]
    );
    if (!rows || rows.length === 0) return null;
    return Number(rows[0].price);
}
