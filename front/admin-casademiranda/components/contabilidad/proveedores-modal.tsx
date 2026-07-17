import { Fragment, useEffect, useState } from 'react';
import { listSuppliers, createSupplier, updateSupplier, deleteSupplier } from '@/services/suppliers';
import type { Supplier, SupplierTemplate } from '@/interfaces/supplier';

const inputClass = "mt-1 w-full border border-gray-light rounded-lg px-3 py-2 text-gray-dark text-sm focus:outline-none focus:border-gray";
const monoInputClass = inputClass + " font-mono text-xs";
const labelClass = "text-xs text-gray uppercase tracking-wide block";

const emptyTemplate: SupplierTemplate = {
    invoiceNumberPattern: null,
    nifPattern: null,
    baseAmountPattern: null,
    vatRatePattern: null,
    totalAmountPattern: null,
    datePattern: null,
};

const TEMPLATE_FIELDS: { key: keyof SupplierTemplate; label: string; placeholder: string }[] = [
    { key: 'invoiceNumberPattern', label: 'Nº Factura', placeholder: String.raw`Factura n[ºo]\.?\s*([\w-]+)` },
    { key: 'nifPattern', label: 'NIF', placeholder: String.raw`NIF:?\s*([A-Z0-9]+)` },
    { key: 'baseAmountPattern', label: 'Base imponible', placeholder: String.raw`Base imponible\s*([\d.,]+)` },
    { key: 'vatRatePattern', label: 'IVA %', placeholder: String.raw`IVA\s*\((\d+)%\)` },
    { key: 'totalAmountPattern', label: 'Total', placeholder: String.raw`Total factura\s*([\d.,]+)\s*€` },
    { key: 'datePattern', label: 'Fecha', placeholder: String.raw`FECHA:\s*(\d{2}/\d{2}/\d{4})` },
];

function TemplateFields({ value, onChange }: { value: SupplierTemplate; onChange: (t: SupplierTemplate) => void }) {
    return (
        <div className="grid grid-cols-1 gap-2 mt-2">
            {TEMPLATE_FIELDS.map(f => (
                <div key={f.key}>
                    <label className={labelClass}>{f.label}</label>
                    <input className={monoInputClass} placeholder={f.placeholder}
                        value={value[f.key] ?? ''}
                        onChange={e => onChange({ ...value, [f.key]: e.target.value })} />
                </div>
            ))}
        </div>
    );
}

interface Props {
    onClose: () => void;
}

export default function ProveedoresModal({ onClose }: Props) {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [name, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [subjectKeyword, setSubjectKeyword] = useState('');
    const [template, setTemplate] = useState<SupplierTemplate>(emptyTemplate);
    const [showTemplate, setShowTemplate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editDomain, setEditDomain] = useState('');
    const [editSubjectKeyword, setEditSubjectKeyword] = useState('');
    const [editTemplate, setEditTemplate] = useState<SupplierTemplate>(emptyTemplate);
    const [showEditTemplate, setShowEditTemplate] = useState(false);
    const [savingEdit, setSavingEdit] = useState(false);
    const [editError, setEditError] = useState('');

    useEffect(() => { load(); }, []);

    async function load() {
        setLoading(true);
        setError('');
        try {
            setSuppliers(await listSuppliers());
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !domain.trim()) {
            setCreateError('Nombre y dominio son obligatorios');
            return;
        }
        setCreating(true);
        setCreateError('');
        try {
            await createSupplier(name.trim(), domain.trim(), subjectKeyword.trim() || null, template);
            setName('');
            setDomain('');
            setSubjectKeyword('');
            setTemplate(emptyTemplate);
            setShowTemplate(false);
            await load();
        } catch (e: any) {
            setCreateError(e.message);
        } finally {
            setCreating(false);
        }
    }

    function startEdit(s: Supplier) {
        setEditingId(s.id);
        setEditName(s.name);
        setEditTemplate({
            invoiceNumberPattern: s.invoiceNumberPattern,
            nifPattern: s.nifPattern,
            baseAmountPattern: s.baseAmountPattern,
            vatRatePattern: s.vatRatePattern,
            totalAmountPattern: s.totalAmountPattern,
            datePattern: s.datePattern,
        });
        setShowEditTemplate(false);
        setEditDomain(s.domain);
        setEditSubjectKeyword(s.subjectKeyword ?? '');
        setEditError('');
    }

    async function handleSaveEdit(id: number) {
        if (!editName.trim() || !editDomain.trim()) {
            setEditError('Nombre y dominio son obligatorios');
            return;
        }
        setSavingEdit(true);
        setEditError('');
        try {
            await updateSupplier(id, editName.trim(), editDomain.trim(), editSubjectKeyword.trim() || null, editTemplate);
            setEditingId(null);
            await load();
        } catch (e: any) {
            setEditError(e.message);
        } finally {
            setSavingEdit(false);
        }
    }

    async function handleDelete(id: number, supplierName: string) {
        if (!confirm(`¿Eliminar el proveedor "${supplierName}"?`)) return;
        try {
            await deleteSupplier(id);
            await load();
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    }

    return (
        <div className="fixed inset-0 bg-gray-dark bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-xl mx-4">
                <h3 className="text-sm font-semibold text-gray-dark mb-1">Proveedores conocidos</h3>
                <p className="text-xs text-gray mb-4">Se usan para detectar automáticamente sus facturas al leer el correo.</p>

                <form onSubmit={handleCreate} noValidate className="mb-4">
                    <div className="grid grid-cols-4 gap-3 items-end">
                        <div>
                            <label className={labelClass}>Nombre</label>
                            <input className={inputClass} value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Dominio email</label>
                            <input className={inputClass} placeholder="proveedor.com" value={domain}
                                onChange={e => setDomain(e.target.value)} />
                        </div>
                        <div>
                            <label className={labelClass}>Palabra clave asunto</label>
                            <input className={inputClass} placeholder="factura (opcional)" value={subjectKeyword}
                                onChange={e => setSubjectKeyword(e.target.value)} />
                        </div>
                        <div>
                            <button type="submit" disabled={creating}
                                className="w-full rounded-full bg-green bg-opacity-50 px-4 py-2 text-sm font-semibold text-gray-dark disabled:opacity-40">
                                {creating ? 'Añadiendo...' : 'Añadir'}
                            </button>
                        </div>
                    </div>
                    <button type="button" onClick={() => setShowTemplate(v => !v)}
                        className="text-xs text-gray hover:text-gray-dark transition-colors mt-2 underline">
                        {showTemplate ? 'Ocultar plantilla de extracción' : 'Plantilla de extracción (opcional)'}
                    </button>
                    {showTemplate && <TemplateFields value={template} onChange={setTemplate} />}
                    {createError && <p className="text-xs text-orange mt-2">{createError}</p>}
                </form>

                {loading ? (
                    <p className="text-sm text-gray">Cargando...</p>
                ) : error ? (
                    <p className="text-sm text-orange">{error}</p>
                ) : (
                    <div className="max-h-72 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-light">
                                    <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Nombre</th>
                                    <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Dominio</th>
                                    <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Palabra clave asunto</th>
                                    <th className="py-2 px-3"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {suppliers.map(s => (
                                    <Fragment key={s.id}>
                                    <tr className="border-b border-gray-light last:border-0">
                                        {editingId === s.id ? (
                                            <>
                                                <td className="py-2 px-3">
                                                    <input className={inputClass} value={editName}
                                                        onChange={e => setEditName(e.target.value)} />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input className={inputClass} value={editDomain}
                                                        onChange={e => setEditDomain(e.target.value)} />
                                                </td>
                                                <td className="py-2 px-3">
                                                    <input className={inputClass} value={editSubjectKeyword}
                                                        onChange={e => setEditSubjectKeyword(e.target.value)} />
                                                </td>
                                                <td className="py-2 px-3 text-right whitespace-nowrap">
                                                    <button onClick={() => setShowEditTemplate(v => !v)}
                                                        className="text-gray hover:text-gray-dark transition-colors text-xs font-semibold mr-3">
                                                        Plantilla
                                                    </button>
                                                    <button onClick={() => handleSaveEdit(s.id)} disabled={savingEdit}
                                                        className="text-gray hover:text-green transition-colors text-xs font-semibold mr-3 disabled:opacity-40">
                                                        Guardar
                                                    </button>
                                                    <button onClick={() => setEditingId(null)}
                                                        className="text-gray hover:text-gray-dark transition-colors text-xs font-semibold">
                                                        Cancelar
                                                    </button>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="py-2 px-3 text-gray-dark font-medium">{s.name}</td>
                                                <td className="py-2 px-3">{s.domain}</td>
                                                <td className="py-2 px-3 text-gray">{s.subjectKeyword ?? '—'}</td>
                                                <td className="py-2 px-3 text-right whitespace-nowrap">
                                                    <button onClick={() => startEdit(s)}
                                                        className="text-gray hover:text-gray-dark transition-colors text-xs font-semibold mr-3">
                                                        Editar
                                                    </button>
                                                    <button onClick={() => handleDelete(s.id, s.name)}
                                                        className="text-gray hover:text-orange transition-colors text-xs font-semibold">
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                    {editingId === s.id && showEditTemplate && (
                                        <tr className="border-b border-gray-light last:border-0">
                                            <td colSpan={4} className="py-2 px-3 bg-gray-light bg-opacity-20">
                                                <TemplateFields value={editTemplate} onChange={setEditTemplate} />
                                            </td>
                                        </tr>
                                    )}
                                    </Fragment>
                                ))}
                                {suppliers.length === 0 && (
                                    <tr><td colSpan={4} className="py-4 px-3 text-center text-gray text-sm">Sin proveedores registrados</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                {editError && <p className="text-xs text-orange mt-2">{editError}</p>}

                <div className="flex justify-end mt-4">
                    <button onClick={onClose}
                        className="px-4 py-2 text-sm text-gray hover:text-gray-dark border border-gray-light rounded-full transition-colors">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
