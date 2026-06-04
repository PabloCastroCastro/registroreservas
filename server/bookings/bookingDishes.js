import executeQuery from '../sql/sqlUtils.js';

export async function listBookingDishes(bookingId) {
    return executeQuery(
        `SELECT bd.booking_dish_id, bd.dish_id, bd.dish_name, bd.portion_type, bd.price, bd.quantity, bd.created_at
         FROM casademiranda.booking_dishes bd
         WHERE bd.booking_id = ?
         ORDER BY bd.created_at`,
        [bookingId]
    );
}

export async function addBookingDish(bookingId, dishId, portionType, quantity) {
    const dishes = await executeQuery(
        'SELECT name, price_full, price_half FROM casademiranda.menu_dishes WHERE dish_id = ? AND active = 1',
        [dishId]
    );
    if (!dishes || dishes.length === 0) throw new Error('Plato no encontrado');

    const dish = dishes[0];
    const price = portionType === 'half' ? (dish.price_half ?? dish.price_full) : dish.price_full;

    const result = await executeQuery(
        `INSERT INTO casademiranda.booking_dishes (booking_id, dish_id, dish_name, portion_type, price, quantity)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [bookingId, dishId, dish.name, portionType, price, quantity]
    );
    return result.insertId;
}

export async function removeBookingDish(bookingDishId) {
    await executeQuery(
        'DELETE FROM casademiranda.booking_dishes WHERE booking_dish_id = ?',
        [bookingDishId]
    );
}
