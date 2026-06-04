import executeQuery from '../sql/sqlUtils.js';

export async function listDishes() {
    return executeQuery(
        'SELECT dish_id, name, description, category, price_full, price_half, observations, advance_notice, min_persons, visible FROM casademiranda.menu_dishes WHERE active = 1 ORDER BY category, name',
        []
    );
}

export async function listPublicDishes() {
    return executeQuery(
        'SELECT name, description, category, price_full, price_half, observations, advance_notice, min_persons FROM casademiranda.menu_dishes WHERE active = 1 AND visible = 1 ORDER BY category, name',
        []
    );
}

export async function createDish(dish) {
    const result = await executeQuery(
        'INSERT INTO casademiranda.menu_dishes (name, description, category, price_full, price_half, observations, advance_notice, min_persons, visible) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [dish.name, dish.description ?? null, dish.category, dish.price_full, dish.price_half ?? null, dish.observations ?? null, dish.advance_notice ? 1 : 0, dish.min_persons ?? null, dish.visible !== false ? 1 : 0]
    );
    return result.insertId;
}

export async function updateDish(id, dish) {
    await executeQuery(
        'UPDATE casademiranda.menu_dishes SET name = ?, description = ?, category = ?, price_full = ?, price_half = ?, observations = ?, advance_notice = ?, min_persons = ?, visible = ? WHERE dish_id = ?',
        [dish.name, dish.description ?? null, dish.category, dish.price_full, dish.price_half ?? null, dish.observations ?? null, dish.advance_notice ? 1 : 0, dish.min_persons ?? null, dish.visible !== false ? 1 : 0, id]
    );
}

export async function deleteDish(id) {
    await executeQuery(
        'UPDATE casademiranda.menu_dishes SET active = 0 WHERE dish_id = ?',
        [id]
    );
}
