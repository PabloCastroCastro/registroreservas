import executeQuery from '../sql/sqlUtils.js';

export async function listBasePrices() {
    const prices = await executeQuery(
        'SELECT id, room_name, season, price, price_extra_bed FROM casademiranda.room_base_prices ORDER BY room_name, season',
        []
    );
    const config = await executeQuery('SELECT high_season_start, high_season_end FROM casademiranda.season_config LIMIT 1', []);
    return { prices, seasonConfig: config[0] };
}

export async function updateBasePrice(id, price, priceExtraBed) {
    await executeQuery(
        'UPDATE casademiranda.room_base_prices SET price = ?, price_extra_bed = ? WHERE id = ?',
        [price, priceExtraBed, id]
    );
}

export async function updateSeasonConfig(highSeasonStart, highSeasonEnd) {
    await executeQuery(
        'UPDATE casademiranda.season_config SET high_season_start = ?, high_season_end = ?',
        [highSeasonStart, highSeasonEnd]
    );
}

export async function getPriceForRoomAndDate(roomName, date) {
    const config = await executeQuery('SELECT high_season_start, high_season_end FROM casademiranda.season_config LIMIT 1', []);
    if (!config || config.length === 0) return null;

    const { high_season_start, high_season_end } = config[0];
    const d = new Date(date);
    const mmdd = String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

    const isHigh = mmdd >= high_season_start && mmdd <= high_season_end;
    const season = isHigh ? 'high' : 'low';

    const rows = await executeQuery(
        'SELECT price, price_extra_bed FROM casademiranda.room_base_prices WHERE room_name = ? AND season = ?',
        [roomName, season]
    );
    if (!rows || rows.length === 0) return null;
    return { price: rows[0].price, priceExtraBed: rows[0].price_extra_bed, season };
}
