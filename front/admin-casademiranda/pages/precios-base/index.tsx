import "@/app/globals.css";
import Navbar from "@/components/navbar/navbar";
import { useEffect, useState } from "react";
import type { RoomBasePrice, SeasonConfig } from "@/interfaces/roomPrice";
import * as API from "@/services/roomPrices";

const ROOMS = ['A Fonte', 'O Carpinteiro', 'O Cuberto', 'O Faiado'];

export default function PreciosBasePage() {
    const [prices, setPrices] = useState<RoomBasePrice[]>([]);
    const [seasonConfig, setSeasonConfig] = useState<SeasonConfig>({ high_season_start: '06-15', high_season_end: '09-15' });
    const [edited, setEdited] = useState<Record<number, { price: string; price_extra_bed: string }>>({});
    const [seasonEdited, setSeasonEdited] = useState<SeasonConfig | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => { load(); }, []);

    async function load() {
        const data = await API.getBasePrices();
        setPrices(data.prices ?? []);
        setSeasonConfig(data.seasonConfig);
    }

    function getEdited(id: number, field: 'price' | 'price_extra_bed', original: number) {
        return edited[id]?.[field] ?? String(original);
    }

    function setEditedField(id: number, field: 'price' | 'price_extra_bed', value: string) {
        setEdited(prev => ({
            ...prev,
            [id]: { ...(prev[id] ?? {}), [field]: value }
        }));
    }

    async function handleSave() {
        setSaving(true);
        const updates = Object.entries(edited).map(([id, vals]) => {
            const orig = prices.find(p => p.id === parseInt(id))!;
            return API.updateBasePrice(
                parseInt(id),
                parseFloat(vals.price ?? String(orig.price)),
                parseFloat(vals.price_extra_bed ?? String(orig.price_extra_bed))
            );
        });
        if (seasonEdited) {
            updates.push(API.updateSeasonConfig(seasonEdited.high_season_start, seasonEdited.high_season_end));
        }
        await Promise.all(updates);
        setEdited({});
        setSeasonEdited(null);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        load();
    }

    const hasChanges = Object.keys(edited).length > 0 || seasonEdited !== null;
    const inputClass = "border border-gray-light rounded-lg px-2 py-1 text-sm text-gray-dark w-24 text-right focus:outline-none focus:border-gray";

    const season = seasonEdited ?? seasonConfig;

    return (
        <>
            <Navbar />
            <div className="px-4 md:px-10 mt-5">
                <div className="flex items-center justify-between mb-5">
                    <h1 className="text-xl text-green text-opacity-75 font-semibold">Precios base</h1>
                    {hasChanges && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-full bg-green bg-opacity-50 px-5 py-2 text-sm font-semibold text-gray-dark disabled:opacity-40"
                        >
                            {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    )}
                    {saved && <p className="text-sm text-green font-medium">Guardado</p>}
                </div>

                {/* Temporada alta */}
                <section className="border border-gray-light rounded-lg p-4 mb-5 max-w-md">
                    <h2 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">Fechas temporada alta</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray uppercase tracking-wide mb-1">Inicio (MM-DD)</p>
                            <input
                                className={inputClass + " w-full"}
                                value={season.high_season_start}
                                placeholder="06-15"
                                onChange={e => setSeasonEdited({ ...season, high_season_start: e.target.value })}
                            />
                        </div>
                        <div>
                            <p className="text-xs text-gray uppercase tracking-wide mb-1">Fin (MM-DD)</p>
                            <input
                                className={inputClass + " w-full"}
                                value={season.high_season_end}
                                placeholder="09-15"
                                onChange={e => setSeasonEdited({ ...season, high_season_end: e.target.value })}
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray mt-2">Temporada baja: resto del año</p>
                </section>

                {/* Tabla de precios */}
                <section className="border border-gray-light rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-light bg-opacity-40">
                            <tr>
                                <th className="text-left px-4 py-3 text-xs text-gray uppercase tracking-wide font-semibold">Habitación</th>
                                <th className="text-center px-4 py-3 text-xs text-gray uppercase tracking-wide font-semibold">Temporada</th>
                                <th className="text-right px-4 py-3 text-xs text-gray uppercase tracking-wide font-semibold">Precio/noche</th>
                                <th className="text-right px-4 py-3 text-xs text-gray uppercase tracking-wide font-semibold">Precio supletoria</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ROOMS.map(room => (
                                (['low', 'high'] as const).map(s => {
                                    const row = prices.find(p => p.room_name === room && p.season === s);
                                    if (!row) return null;
                                    return (
                                        <tr key={row.id} className="border-t border-gray-light">
                                            <td className="px-4 py-3 font-medium text-gray-dark">{s === 'low' ? room : ''}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-xs rounded-full px-2 py-0.5 font-medium ${s === 'high' ? 'bg-yellow bg-opacity-50 text-gray-dark' : 'bg-gray-light text-gray'}`}>
                                                    {s === 'high' ? 'Alta' : 'Baja'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    className={inputClass}
                                                    type="number" min="0" step="0.01"
                                                    value={getEdited(row.id, 'price', row.price)}
                                                    onChange={e => setEditedField(row.id, 'price', e.target.value)}
                                                />
                                                <span className="ml-1 text-gray">€</span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <input
                                                    className={inputClass}
                                                    type="number" min="0" step="0.01"
                                                    value={getEdited(row.id, 'price_extra_bed', row.price_extra_bed)}
                                                    onChange={e => setEditedField(row.id, 'price_extra_bed', e.target.value)}
                                                />
                                                <span className="ml-1 text-gray">€</span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </>
    );
}
