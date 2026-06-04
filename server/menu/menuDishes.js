import executeQuery from '../sql/sqlUtils.js';

export async function listDishes() {
    return executeQuery(
        'SELECT dish_id, name, description, category, price_full, price_half, observations FROM casademiranda.menu_dishes WHERE active = 1 ORDER BY category, name',
        []
    );
}

export async function createDish(dish) {
    const result = await executeQuery(
        'INSERT INTO casademiranda.menu_dishes (name, description, category, price_full, price_half, observations) VALUES (?, ?, ?, ?, ?, ?)',
        [dish.name, dish.description ?? null, dish.category, dish.price_full, dish.price_half ?? null, dish.observations ?? null]
    );
    return result.insertId;
}

export async function updateDish(id, dish) {
    await executeQuery(
        'UPDATE casademiranda.menu_dishes SET name = ?, description = ?, category = ?, price_full = ?, price_half = ?, observations = ? WHERE dish_id = ?',
        [dish.name, dish.description ?? null, dish.category, dish.price_full, dish.price_half ?? null, dish.observations ?? null, id]
    );
}

export async function deleteDish(id) {
    await executeQuery(
        'UPDATE casademiranda.menu_dishes SET active = 0 WHERE dish_id = ?',
        [id]
    );
}
