import { useEffect, useState } from 'react';
import {
    listSupplierInvoices,
    createSupplierInvoice,
    updateSupplierInvoice,
    deleteSupplierInvoice,
    getPendingSupplierEmails,
    viewSupplierInvoiceFile,
} from '@/services/supplierInvoices';
import type { SupplierInvoice, PendingSupplierEmail } from '@/interfaces/supplierInvoice';

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
    invoiceNumber: string;
    nif: string;
    date: string;
    supplierName: string;
    baseAmount: string;
    vatPercent: string;
    totalAmount: string;
    reference: string;
    notes: string;
    emailUid: number | null;
    file: File | null;
    hasExistingFile: boolean;
    fromEmailAttachment: boolean;
}

const emptyForm: FormState = {
    id: null, invoiceNumber: '', nif: '', date: '', supplierName: '',
    baseAmount: '', vatPercent: '21', totalAmount: '', reference: '', notes: '', emailUid: null,
    file: null, hasExistingFile: false, fromEmailAttachment: false,
};

export default function FacturasProveedores() {
    const [year, setYear] = useState(currentYear);
    const [quarter, setQuarter] = useState(currentQuarter());
    const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [form, setForm] = useState<FormState | null>(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const [checkingMail, setCheckingMail] = useState(false);
    const [mailQueue, setMailQueue] = useState<PendingSupplierEmail[]>([]);

    useEffect(() => { load(); }, [year, quarter]);

    async function load() {
        setLoading(true);
        setError('');
        try {
            setInvoices(await listSupplierInvoices(year, quarter));
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

    function openEdit(inv: SupplierInvoice) {
        setFormError('');
        setForm({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber ?? '',
            nif: inv.nif ?? '',
            date: inv.date.slice(0, 10),
            supplierName: inv.supplierName,
            baseAmount: inv.baseAmount != null ? String(inv.baseAmount) : '',
            vatPercent: inv.vatRate != null ? String(inv.vatRate * 100) : '',
            totalAmount: String(inv.totalAmount),
            reference: inv.reference ?? '',
            notes: inv.notes ?? '',
            emailUid: null,
            file: null,
            hasExistingFile: !!inv.filePath,
            fromEmailAttachment: false,
        });
    }

    function openFromEmail(email: PendingSupplierEmail) {
        setFormError('');
        setForm({
            ...emptyForm,
            date: (email.date ?? '').slice(0, 10),
            supplierName: email.supplierName,
            reference: email.subject,
            emailUid: email.uid,
            fromEmailAttachment: email.hasAttachment,
        });
    }

    function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
        setForm(prev => {
            if (!prev) return prev;
            const next = { ...prev, [key]: value };
            if (key === 'baseAmount' || key === 'vatPercent') {
                const base = parseFloat(next.baseAmount);
                const vat = parseFloat(next.vatPercent);
                if (!isNaN(base) && !isNaN(vat)) {
                    next.totalAmount = (base + base * vat / 100).toFixed(2);
                }
            }
            return next;
        });
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!form) return;
        if (!form.date || !form.supplierName.trim() || !form.totalAmount) {
            setFormError('Fecha, proveedor y total son obligatorios');
            return;
        }
        setSaving(true);
        setFormError('');
        try {
            const base = parseFloat(form.baseAmount);
            const vat = parseFloat(form.vatPercent);
            const payload = {
                invoiceNumber: form.invoiceNumber || null,
                nif: form.nif || null,
                date: form.date,
                supplierName: form.supplierName.trim(),
                baseAmount: isNaN(base) ? null : base,
                vatRate: isNaN(vat) ? null : vat / 100,
                vatAmount: (!isNaN(base) && !isNaN(vat)) ? Number((base * vat / 100).toFixed(2)) : null,
                totalAmount: parseFloat(form.totalAmount),
                reference: form.reference || null,
                notes: form.notes || null,
                ...(form.emailUid ? { emailUid: form.emailUid } : {}),
                ...(form.file ? { file: form.file } : {}),
            };
            if (form.id) {
                await updateSupplierInvoice(form.id, payload);
            } else {
                await createSupplierInvoice(payload);
            }
            setForm(null);
            await load();

            if (mailQueue.length > 0) {
                const [next, ...rest] = mailQueue;
                setMailQueue(rest);
                openFromEmail(next);
            }
        } catch (e: any) {
            setFormError(e.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleViewFile(id: number) {
        try {
            const blob = await viewSupplierInvoiceFile(id);
            window.open(URL.createObjectURL(blob), '_blank');
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    }

    async function handleDelete(id: number, supplierName: string) {
        if (!confirm(`¿Eliminar la factura de "${supplierName}"?`)) return;
        try {
            await deleteSupplierInvoice(id);
            await load();
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    }

    async function handleCheckMail() {
        setCheckingMail(true);
        try {
            const pending = await getPendingSupplierEmails();
            if (pending.length === 0) {
                alert('No hay correos de proveedores conocidos pendientes de leer.');
                return;
            }
            const [first, ...rest] = pending;
            setMailQueue(rest);
            openFromEmail(first);
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setCheckingMail(false);
        }
    }

    const totals = invoices.reduce((acc, i) => ({
        base: acc.base + (i.baseAmount ?? 0),
        vat: acc.vat + (i.vatAmount ?? 0),
        total: acc.total + i.totalAmount,
    }), { base: 0, vat: 0, total: 0 });

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
                    <button onClick={handleCheckMail} disabled={checkingMail}
                        className="rounded-full border border-gray-light px-4 py-2 text-sm font-semibold text-gray-dark hover:border-gray transition-colors disabled:opacity-40">
                        {checkingMail ? 'Comprobando...' : 'Leer correo'}
                    </button>
                    <button onClick={openNew}
                        className="rounded-full bg-green bg-opacity-50 px-4 py-2 text-sm font-semibold text-gray-dark">
                        Añadir factura
                    </button>
                </div>
            </div>

            {loading ? (
                <p className="text-sm text-gray">Cargando...</p>
            ) : error ? (
                <p className="text-sm text-orange">{error}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-light">
                                <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Nº Factura</th>
                                <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Proveedor</th>
                                <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Fecha</th>
                                <th className="text-right py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Base</th>
                                <th className="text-right py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">IVA%</th>
                                <th className="text-right py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Total</th>
                                <th className="py-2 px-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv.id} className="border-b border-gray-light last:border-0">
                                    <td className="py-2 px-3 text-gray-dark font-medium">{inv.invoiceNumber ?? '—'}</td>
                                    <td className="py-2 px-3">{inv.supplierName}</td>
                                    <td className="py-2 px-3">{new Date(inv.date).toLocaleDateString('es-ES')}</td>
                                    <td className="py-2 px-3 text-right">{inv.baseAmount != null ? inv.baseAmount.toFixed(2) + ' €' : '—'}</td>
                                    <td className="py-2 px-3 text-right">{inv.vatRate != null ? (inv.vatRate * 100).toFixed(0) + '%' : '—'}</td>
                                    <td className="py-2 px-3 text-right">{inv.totalAmount.toFixed(2)} €</td>
                                    <td className="py-2 px-3 text-right whitespace-nowrap">
                                        {inv.filePath && (
                                            <button onClick={() => handleViewFile(inv.id)}
                                                className="text-gray hover:text-gray-dark transition-colors text-xs font-semibold mr-3">
                                                Ver factura
                                            </button>
                                        )}
                                        <button onClick={() => openEdit(inv)}
                                            className="text-gray hover:text-gray-dark transition-colors text-xs font-semibold mr-3">
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(inv.id, inv.supplierName)}
                                            className="text-gray hover:text-orange transition-colors text-xs font-semibold">
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr><td colSpan={7} className="py-4 px-3 text-center text-gray text-sm">Sin facturas en este periodo</td></tr>
                            )}
                        </tbody>
                        {invoices.length > 0 && (
                            <tfoot>
                                <tr>
                                    <td colSpan={3} className="py-2 px-3 text-right text-xs text-gray uppercase tracking-wide font-semibold">Totales periodo</td>
                                    <td className="py-2 px-3 text-right font-semibold text-gray-dark">{totals.base.toFixed(2)} €</td>
                                    <td className="py-2 px-3 text-right font-semibold text-gray-dark">{totals.vat.toFixed(2)} €</td>
                                    <td className="py-2 px-3 text-right font-semibold text-gray-dark">{totals.total.toFixed(2)} €</td>
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
                            {form.id ? 'Editar factura de proveedor' : 'Nueva factura de proveedor'}
                        </h3>
                        <form onSubmit={handleSave} noValidate>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className={labelClass}>Nº Factura</label>
                                    <input className={inputClass} value={form.invoiceNumber}
                                        onChange={e => updateForm('invoiceNumber', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>NIF</label>
                                    <input className={inputClass} value={form.nif}
                                        onChange={e => updateForm('nif', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>Proveedor *</label>
                                    <input className={inputClass} value={form.supplierName}
                                        onChange={e => updateForm('supplierName', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>Fecha *</label>
                                    <input className={inputClass} type="date" value={form.date}
                                        onChange={e => updateForm('date', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>Base</label>
                                    <input className={inputClass} type="number" step="0.01" value={form.baseAmount}
                                        onChange={e => updateForm('baseAmount', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>IVA %</label>
                                    <input className={inputClass} type="number" step="0.01" value={form.vatPercent}
                                        onChange={e => updateForm('vatPercent', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>Total *</label>
                                    <input className={inputClass} type="number" step="0.01" value={form.totalAmount}
                                        onChange={e => updateForm('totalAmount', e.target.value)} />
                                </div>
                                <div>
                                    <label className={labelClass}>Referencia</label>
                                    <input className={inputClass} value={form.reference}
                                        onChange={e => updateForm('reference', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelClass}>Notas</label>
                                    <textarea className={inputClass} rows={2} value={form.notes}
                                        onChange={e => updateForm('notes', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelClass}>Factura adjunta (PDF o imagen)</label>
                                    <input className={inputClass} type="file" accept="application/pdf,image/*"
                                        onChange={e => updateForm('file', e.target.files?.[0] ?? null)} />
                                    {form.fromEmailAttachment && !form.file && (
                                        <p className="text-xs text-gray mt-1">Este correo trae un adjunto: se guardará automáticamente si no seleccionas otro fichero.</p>
                                    )}
                                    {form.hasExistingFile && !form.file && (
                                        <p className="text-xs text-gray mt-1">Ya hay un fichero adjunto. Selecciona uno nuevo para reemplazarlo.</p>
                                    )}
                                </div>
                            </div>
                            {formError && <p className="text-xs text-orange mb-3">{formError}</p>}
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => { setForm(null); setMailQueue([]); }}
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
        </div>
    );
}
