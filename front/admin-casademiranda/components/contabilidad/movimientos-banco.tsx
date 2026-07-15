import { useEffect, useRef, useState } from 'react';
import {
    listBankMovements,
    createBankMovement,
    updateBankMovement,
    deleteBankMovement,
    previewBankMovementsImport,
    commitBankMovementsImport,
} from '@/services/bankMovements';
import type { BankMovement, BankMovementType, BankMovementPreview } from '@/interfaces/bankMovement';

const inputClass = "mt-1 w-full border border-gray-light rounded-lg px-3 py-2 text-gray-dark text-sm focus:outline-none focus:border-gray";
const labelClass = "text-xs text-gray uppercase tracking-wide block";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);
const QUARTERS = [1, 2, 3, 4];

function currentQuarter() {
    return Math.ceil((new Date().getMonth() + 1) / 3);
}

interface FormState {
    id: number | null;
    date: string;
    type: BankMovementType;
    description: string;
    amount: string;
    notes: string;
}

const emptyForm: FormState = { id: null, date: '', type: 'gasto', description: '', amount: '', notes: '' };

interface PreviewRow extends BankMovementPreview {
    selected: boolean;
}

export default function MovimientosBanco() {
    const [year, setYear] = useState(currentYear);
    const [quarter, setQuarter] = useState(currentQuarter());
    const [movements, setMovements] = useState<BankMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [form, setForm] = useState<FormState | null>(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewRows, setPreviewRows] = useState<PreviewRow[] | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState('');
    const [importing, setImporting] = useState(false);

    useEffect(() => { load(); }, [year, quarter]);

    async function load() {
        setLoading(true);
        setError('');
        try {
            setMovements(await listBankMovements(year, quarter));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    function openNew() {
        setFormError('');
        setForm({ ...emptyForm });
    }

    function openEdit(m: BankMovement) {
        setFormError('');
        setForm({
            id: m.id,
            date: m.date.slice(0, 10),
            type: m.type,
            description: m.description,
            amount: String(m.amount),
            notes: m.notes ?? '',
        });
    }

    function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm(prev => prev ? { ...prev, [key]: value } : prev);
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!form) return;
        if (!form.date || !form.description.trim() || !form.amount) {
            setFormError('Fecha, razón e importe son obligatorios');
            return;
        }
        setSaving(true);
        setFormError('');
        try {
            const payload = {
                date: form.date,
                type: form.type,
                description: form.description.trim(),
                amount: parseFloat(form.amount),
                notes: form.notes || null,
            };
            if (form.id) {
                await updateBankMovement(form.id, payload);
            } else {
                await createBankMovement(payload);
            }
            setForm(null);
            await load();
        } catch (e: any) {
            setFormError(e.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: number, description: string) {
        if (!confirm(`¿Eliminar el movimiento "${description}"?`)) return;
        try {
            await deleteBankMovement(id);
            await load();
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    }

    function openImportPicker() {
        fileInputRef.current?.click();
    }

    async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setPreviewError('');
        setPreviewLoading(true);
        try {
            const rows = await previewBankMovementsImport(file);
            setPreviewRows(rows.map(r => ({ ...r, selected: !r.duplicate })));
        } catch (err: any) {
            setPreviewError(err.message);
            setPreviewRows(null);
        } finally {
            setPreviewLoading(false);
        }
    }

    function togglePreviewRow(index: number) {
        setPreviewRows(prev => prev?.map((r, i) => i === index ? { ...r, selected: !r.selected } : r) ?? null);
    }

    async function handleImportConfirm() {
        if (!previewRows) return;
        const selected = previewRows.filter(r => r.selected);
        if (selected.length === 0) {
            setPreviewError('No hay ningún movimiento seleccionado');
            return;
        }
        setImporting(true);
        setPreviewError('');
        try {
            await commitBankMovementsImport(selected.map(({ date, type, description, amount, notes }) =>
                ({ date, type, description, amount, notes })
            ));
            setPreviewRows(null);
            await load();
        } catch (err: any) {
            setPreviewError(err.message);
        } finally {
            setImporting(false);
        }
    }

    const totalIngresos = movements.filter(m => m.type === 'ingreso').reduce((sum, m) => sum + m.amount, 0);
    const totalGastos = movements.filter(m => m.type === 'gasto').reduce((sum, m) => sum + m.amount, 0);

    return (
        <div>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
                <div className="grid grid-cols-2 gap-4 max-w-xs">
                    <div>
                        <label className={labelClass}>Año</label>
                        <select className={inputClass} value={year} onChange={e => setYear(Number(e.target.value))}>
                            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Trimestre</label>
                        <select className={inputClass} value={quarter} onChange={e => setQuarter(Number(e.target.value))}>
                            {QUARTERS.map(q => <option key={q} value={q}>T{q}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex gap-3">
                    <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden"
                        onChange={handleFileSelected} />
                    <button onClick={openImportPicker} disabled={previewLoading}
                        className="rounded-full border border-gray-light px-4 py-2 text-sm font-semibold text-gray-dark disabled:opacity-40">
                        {previewLoading ? 'Leyendo...' : 'Importar CSV'}
                    </button>
                    <button onClick={openNew}
                        className="rounded-full bg-green bg-opacity-50 px-4 py-2 text-sm font-semibold text-gray-dark">
                        Añadir movimiento
                    </button>
                </div>
            </div>
            {previewError && !previewRows && <p className="text-xs text-orange mb-4">{previewError}</p>}

            {loading ? (
                <p className="text-sm text-gray">Cargando...</p>
            ) : error ? (
                <p className="text-sm text-orange">{error}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-light">
                                <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Tipo</th>
                                <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Fecha</th>
                                <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Razón</th>
                                <th className="text-right py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Importe</th>
                                <th className="py-2 px-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {movements.map(m => (
                                <tr key={m.id} className="border-b border-gray-light last:border-0">
                                    <td className="py-2 px-3">
                                        <span className={m.type === 'ingreso' ? 'text-green font-semibold' : 'text-orange font-semibold'}>
                                            {m.type === 'ingreso' ? 'Ingreso' : 'Gasto'}
                                        </span>
                                    </td>
                                    <td className="py-2 px-3">{new Date(m.date).toLocaleDateString('es-ES')}</td>
                                    <td className="py-2 px-3">{m.description}</td>
                                    <td className="py-2 px-3 text-right">{m.amount.toFixed(2)} €</td>
                                    <td className="py-2 px-3 text-right whitespace-nowrap">
                                        <button onClick={() => openEdit(m)}
                                            className="text-gray hover:text-gray-dark transition-colors text-xs font-semibold mr-3">
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(m.id, m.description)}
                                            className="text-gray hover:text-orange transition-colors text-xs font-semibold">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {movements.length === 0 && (
                                <tr><td colSpan={5} className="py-4 px-3 text-center text-gray text-sm">Sin movimientos en este periodo</td></tr>
                            )}
                        </tbody>
                        {movements.length > 0 && (
                            <tfoot>
                                <tr>
                                    <td colSpan={3} className="py-2 px-3 text-right text-xs text-gray uppercase tracking-wide font-semibold">Total ingresos</td>
                                    <td className="py-2 px-3 text-right font-semibold text-gray-dark">{totalIngresos.toFixed(2)} €</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={3} className="py-2 px-3 text-right text-xs text-gray uppercase tracking-wide font-semibold">Total gastos</td>
                                    <td className="py-2 px-3 text-right font-semibold text-gray-dark">{totalGastos.toFixed(2)} €</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}

            {form && (
                <div className="fixed inset-0 bg-gray-dark bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg mx-4">
                        <h3 className="text-sm font-semibold text-gray-dark mb-4">
                            {form.id ? 'Editar movimiento' : 'Nuevo movimiento'}
                        </h3>
                        <form onSubmit={handleSave} noValidate>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className={labelClass}>Tipo *</label>
                                    <select className={inputClass} value={form.type}
                                        onChange={e => updateForm('type', e.target.value as BankMovementType)}>
                                        <option value="gasto">Gasto</option>
                                        <option value="ingreso">Ingreso</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Fecha *</label>
                                    <input className={inputClass} type="date" value={form.date}
                                        onChange={e => updateForm('date', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelClass}>Razón *</label>
                                    <input className={inputClass} value={form.description}
                                        onChange={e => updateForm('description', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>Importe *</label>
                                    <input className={inputClass} type="number" step="0.01" value={form.amount}
                                        onChange={e => updateForm('amount', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelClass}>Comentarios</label>
                                    <textarea className={inputClass} rows={2} value={form.notes}
                                        onChange={e => updateForm('notes', e.target.value)} />
                                </div>
                            </div>
                            {formError && <p className="text-xs text-orange mb-3">{formError}</p>}
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setForm(null)}
                                    className="px-4 py-2 text-sm text-gray hover:text-gray-dark border border-gray-light rounded-full transition-colors">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving}
                                    className="px-4 py-2 text-sm font-semibold rounded-full bg-green bg-opacity-50 text-gray-dark disabled:opacity-40">
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {previewRows && (
                <div className="fixed inset-0 bg-gray-dark bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl mx-4 max-h-[85vh] flex flex-col">
                        <h3 className="text-sm font-semibold text-gray-dark mb-1">Importar movimientos desde CSV</h3>
                        <p className="text-xs text-gray mb-4">
                            {previewRows.filter(r => r.duplicate).length > 0
                                ? `Se han detectado ${previewRows.filter(r => r.duplicate).length} movimientos que ya existen en este rango de fechas y aparecen desmarcados. Revisa la selección antes de importar.`
                                : 'Revisa los movimientos detectados antes de importarlos.'}
                        </p>
                        <div className="overflow-y-auto flex-1 mb-4">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-light sticky top-0 bg-white">
                                        <th className="py-2 px-3"></th>
                                        <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Tipo</th>
                                        <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Fecha</th>
                                        <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Razón</th>
                                        <th className="text-right py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Importe</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewRows.map((r, i) => (
                                        <tr key={i} className={`border-b border-gray-light last:border-0 ${r.duplicate ? 'opacity-50' : ''}`}>
                                            <td className="py-2 px-3">
                                                <input type="checkbox" checked={r.selected} onChange={() => togglePreviewRow(i)} />
                                            </td>
                                            <td className="py-2 px-3">
                                                <span className={r.type === 'ingreso' ? 'text-green font-semibold' : 'text-orange font-semibold'}>
                                                    {r.type === 'ingreso' ? 'Ingreso' : 'Gasto'}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3">{new Date(r.date).toLocaleDateString('es-ES')}</td>
                                            <td className="py-2 px-3">
                                                {r.description}
                                                {r.duplicate && <span className="ml-2 text-xs text-gray">(ya existe)</span>}
                                            </td>
                                            <td className="py-2 px-3 text-right">{r.amount.toFixed(2)} €</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {previewError && <p className="text-xs text-orange mb-3">{previewError}</p>}
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray">{previewRows.filter(r => r.selected).length} de {previewRows.length} seleccionados</p>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setPreviewRows(null)}
                                    className="px-4 py-2 text-sm text-gray hover:text-gray-dark border border-gray-light rounded-full transition-colors">
                                    Cancelar
                                </button>
                                <button type="button" onClick={handleImportConfirm} disabled={importing}
                                    className="px-4 py-2 text-sm font-semibold rounded-full bg-green bg-opacity-50 text-gray-dark disabled:opacity-40">
                                    {importing ? 'Importando...' : 'Importar seleccionados'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
