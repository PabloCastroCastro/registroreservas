import executeQuery from '../sql/sqlUtils.js';

const parseAllergens = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
};

const mapDish = (row) => ({ ...row, allergens: parseAllergens(row.allergens) });

export async function listDishes() {
    const rows = await executeQuery(
        'SELECT dish_id, name, description, category, price_full, price_half, observations, advance_notice, min_persons, visible, allergens FROM casademiranda.menu_dishes WHERE active = 1 ORDER BY category, name',
        []
    );
    return rows.map(mapDish);
}

export async function listPublicDishes() {
    const rows = await executeQuery(
        'SELECT name, description, category, price_full, price_half, observations, advance_notice, min_persons, allergens FROM casademiranda.menu_dishes WHERE active = 1 AND visible = 1 ORDER BY category, name',
        []
    );
    return rows.map(mapDish);
}

export async function createDish(dish) {
    const result = await executeQuery(
        'INSERT INTO casademiranda.menu_dishes (name, description, category, price_full, price_half, observations, advance_notice, min_persons, visible, allergens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [dish.name, dish.description ?? null, dish.category, dish.price_full, dish.price_half ?? null, dish.observations ?? null, dish.advance_notice ? 1 : 0, dish.min_persons ?? null, dish.visible !== false ? 1 : 0, JSON.stringify(dish.allergens ?? [])]
    );
    return result.insertId;
}

export async function updateDish(id, dish) {
    await executeQuery(
        'UPDATE casademiranda.menu_dishes SET name = ?, description = ?, category = ?, price_full = ?, price_half = ?, observations = ?, advance_notice = ?, min_persons = ?, visible = ?, allergens = ? WHERE dish_id = ?',
        [dish.name, dish.description ?? null, dish.category, dish.price_full, dish.price_half ?? null, dish.observations ?? null, dish.advance_notice ? 1 : 0, dish.min_persons ?? null, dish.visible !== false ? 1 : 0, JSON.stringify(dish.allergens ?? []), id]
    );
}

export async function deleteDish(id) {
    await executeQuery(
        'UPDATE casademiranda.menu_dishes SET active = 0 WHERE dish_id = ?',
        [id]
    );
}
