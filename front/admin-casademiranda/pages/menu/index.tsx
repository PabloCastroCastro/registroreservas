import "@/app/globals.css";
import Navbar from "@/components/navbar/navbar";
import { useEffect, useState } from "react";
import type { Dish, RequestDish, MenuCategory } from "@/interfaces/menu";
import { MENU_CATEGORIES } from "@/interfaces/menu";
import * as APIMenu from "@/services/menu";

const EMPTY_DISH: RequestDish = {
    name: '',
    description: null,
    category: 'Principal',
    price_full: 0,
    price_half: null,
    observations: null,
};

export default function MenuPage() {
    const [dishes, setDishes] = useState<Dish[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Dish | null>(null);
    const [form, setForm] = useState<RequestDish>(EMPTY_DISH);
    const [saving, setSaving] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<Dish | null>(null);

    useEffect(() => { load(); }, []);

    async function load() {
        const data = await APIMenu.getDishes();
        setDishes(data ?? []);
    }

    function openNew() {
        setEditing(null);
        setForm(EMPTY_DISH);
        setShowModal(true);
    }

    function openEdit(dish: Dish) {
        setEditing(dish);
        setForm({
            name: dish.name,
            description: dish.description,
            category: dish.category,
            price_full: dish.price_full,
            price_half: dish.price_half,
            observations: dish.observations,
        });
        setShowModal(true);
    }

    async function handleSave() {
        if (!form.name.trim() || !form.category) return;
        setSaving(true);
        if (editing) {
            await APIMenu.updateDish(editing.dish_id, form);
        } else {
            await APIMenu.createDish(form);
        }
        setSaving(false);
        setShowModal(false);
        load();
    }

    async function handleDelete() {
        if (!confirmDelete) return;
        await APIMenu.deleteDish(confirmDelete.dish_id);
        setConfirmDelete(null);
        load();
    }

    function set(field: keyof RequestDish, value: any) {
        setForm(prev => ({ ...prev, [field]: value }));
    }

    const byCategory = MENU_CATEGORIES.reduce((acc, cat) => {
        acc[cat] = dishes.filter(d => d.category === cat);
        return acc;
    }, {} as Record<MenuCategory, Dish[]>);

    const inputClass = "rounded w-full border border-gray-light px-3 py-2 text-sm text-gray-dark";
    const labelClass = "text-xs text-gray uppercase tracking-wide block mb-1";

    return (
        <>
            <Navbar />
            <div className="px-4 md:px-10 mt-5">
                <div className="flex items-center justify-between mb-5">
                    <h1 className="text-xl text-green text-opacity-75 font-semibold">Carta de cenas</h1>
                    <button
                        onClick={openNew}
                        className="rounded-full bg-green bg-opacity-50 px-5 py-2 text-sm font-semibold text-gray-dark"
                    >
                        + Añadir plato
                    </button>
                </div>

                {dishes.length === 0 ? (
                    <p className="text-gray text-sm">No hay platos registrados.</p>
                ) : (
                    MENU_CATEGORIES.map(cat => byCategory[cat].length > 0 && (
                        <section key={cat} className="mb-6">
                            <h2 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">{cat}</h2>
                            <div className="flex flex-col gap-2">
                                {byCategory[cat].map(dish => (
                                    <div key={dish.dish_id} className="border border-gray-light rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-3">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-dark">{dish.name}</p>
                                            {dish.description && <p className="text-sm text-gray mt-0.5">{dish.description}</p>}
                                            {dish.observations && (
                                                <p className="text-xs text-gray mt-1 italic">{dish.observations}</p>
                                            )}
                                        </div>
                                        <div className="flex gap-4 items-center shrink-0">
                                            <div className="text-center">
                                                <p className="text-xs text-gray uppercase tracking-wide">Ración</p>
                                                <p className="font-semibold text-gray-dark">{Number(dish.price_full).toFixed(2)} €</p>
                                            </div>
                                            {dish.price_half != null && (
                                                <div className="text-center">
                                                    <p className="text-xs text-gray uppercase tracking-wide">Media</p>
                                                    <p className="font-semibold text-gray-dark">{Number(dish.price_half).toFixed(2)} €</p>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => openEdit(dish)}
                                                className="rounded-full bg-blue bg-opacity-50 px-3 py-1 text-xs font-semibold text-gray-dark"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => setConfirmDelete(dish)}
                                                className="rounded-full bg-orange bg-opacity-50 px-3 py-1 text-xs font-semibold text-gray-dark"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))
                )}
            </div>

            {/* Modal crear/editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto py-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg mx-4">
                        <h2 className="text-xl font-semibold mb-4 text-gray-dark">
                            {editing ? 'Editar plato' : 'Nuevo plato'}
                        </h2>
                        <div className="flex flex-col gap-3">
                            <div>
                                <label className={labelClass}>Nombre *</label>
                                <input className={inputClass} value={form.name} onChange={e => set('name', e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>Categoría *</label>
                                <select className={inputClass} value={form.category} onChange={e => set('category', e.target.value as MenuCategory)}>
                                    {MENU_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Descripción</label>
                                <textarea className={inputClass} rows={2} value={form.description ?? ''} onChange={e => set('description', e.target.value || null)} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelClass}>Precio ración entera (€) *</label>
                                    <input className={inputClass} type="number" min="0" step="0.01" value={form.price_full} onChange={e => set('price_full', parseFloat(e.target.value) || 0)} />
                                </div>
                                <div>
                                    <label className={labelClass}>Precio media ración (€)</label>
                                    <input className={inputClass} type="number" min="0" step="0.01" value={form.price_half ?? ''} placeholder="—" onChange={e => set('price_half', e.target.value ? parseFloat(e.target.value) : null)} />
                                </div>
                            </div>
                            <div>
                                <label className={labelClass}>Observaciones</label>
                                <textarea className={inputClass} rows={2} value={form.observations ?? ''} onChange={e => set('observations', e.target.value || null)} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-5">
                            <button className="rounded-full bg-gray-light px-5 py-2 text-sm font-semibold text-gray-dark" onClick={() => setShowModal(false)}>Cancelar</button>
                            <button
                                className="rounded-full bg-green bg-opacity-50 px-5 py-2 text-sm font-semibold text-gray-dark disabled:opacity-40"
                                onClick={handleSave}
                                disabled={saving || !form.name.trim()}
                            >
                                {saving ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal confirmar eliminar */}
            {confirmDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center max-w-sm mx-4">
                        <h2 className="text-lg font-semibold mb-2 text-gray-dark">¿Eliminar plato?</h2>
                        <p className="text-sm text-gray mb-4">{confirmDelete.name}</p>
                        <div className="flex justify-center gap-4">
                            <button className="rounded-full bg-gray-light px-5 py-2 text-sm font-semibold text-gray-dark" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                            <button className="rounded-full bg-orange bg-opacity-50 px-5 py-2 text-sm font-semibold text-gray-dark" onClick={handleDelete}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
