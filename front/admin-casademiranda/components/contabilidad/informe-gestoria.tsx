import { useEffect, useState } from 'react';
import { getInformeGestoria, downloadInformeExcel } from '@/services/informeGestoria';
import type { InformeGestoria } from '@/interfaces/informeGestoria';

const inputClass = "mt-1 w-full border border-gray-light rounded-lg px-3 py-2 text-gray-dark text-sm focus:outline-none focus:border-gray";
const labelClass = "text-xs text-gray uppercase tracking-wide block";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);
const QUARTERS = [1, 2, 3, 4];

function currentQuarter() {
    return Math.ceil((new Date().getMonth() + 1) / 3);
}

export default function InformeGestoriaTab() {
    const [year, setYear] = useState(currentYear);
    const [quarter, setQuarter] = useState(currentQuarter());
    const [informe, setInforme] = useState<InformeGestoria | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showClientes, setShowClientes] = useState(false);
    const [showProveedores, setShowProveedores] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => { load(); }, [year, quarter]);

    async function load() {
        setLoading(true);
        setError('');
        try {
            setInforme(await getInformeGestoria(year, quarter));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleExport() {
        setExporting(true);
        try {
            const blob = await downloadInformeExcel(year, quarter);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `InformeGestoria_${year}T${quarter}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setExporting(false);
        }
    }

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
                <button onClick={handleExport} disabled={exporting || loading}
                    className="rounded-full bg-green bg-opacity-50 px-4 py-2 text-sm font-semibold text-gray-dark disabled:opacity-40">
                    {exporting ? 'Exportando...' : 'Exportar Excel'}
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-gray">Cargando...</p>
            ) : error ? (
                <p className="text-sm text-orange">{error}</p>
            ) : informe && (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-6 max-w-xl">
                        <div className="border border-gray-light rounded-lg p-4">
                            <p className={labelClass}>Ingresos</p>
                            <p className="text-lg font-semibold text-gray-dark">{informe.ingresos.toFixed(2)} €</p>
                        </div>
                        <div className="border border-gray-light rounded-lg p-4">
                            <p className={labelClass}>Gastos</p>
                            <p className="text-lg font-semibold text-gray-dark">{informe.gastos.toFixed(2)} €</p>
                        </div>
                        <div className="border border-gray-light rounded-lg p-4">
                            <p className={labelClass}>Resultado</p>
                            <p className="text-lg font-semibold text-gray-dark">{informe.resultado.toFixed(2)} €</p>
                        </div>
                    </div>

                    <button onClick={() => setShowClientes(v => !v)}
                        className="text-xs text-gray hover:text-gray-dark transition-colors underline block mb-2">
                        {showClientes ? 'Ocultar detalle de clientes' : `Ver detalle de clientes (${informe.clientes.length})`}
                    </button>
                    {showClientes && (
                        <div className="overflow-x-auto mb-6">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-light">
                                        <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Reserva</th>
                                        <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Checkout</th>
                                        <th className="text-right py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Noches</th>
                                        <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Habitación</th>
                                        <th className="text-right py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Precio habitación</th>
                                        <th className="text-right py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Supletorias</th>
                                        <th className="text-right py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {informe.clientes.map((c, i) => (
                                        <tr key={i} className="border-b border-gray-light last:border-0">
                                            <td className="py-2 px-3 text-gray-dark font-medium">{c.confirmationNumber}</td>
                                            <td className="py-2 px-3">{new Date(c.checkOut).toLocaleDateString('es-ES')}</td>
                                            <td className="py-2 px-3 text-right">{c.nights}</td>
                                            <td className="py-2 px-3">{c.roomName}</td>
                                            <td className="py-2 px-3 text-right">{c.roomPrice.toFixed(2)} €</td>
                                            <td className="py-2 px-3 text-right">{c.extraBedPrice != null ? c.extraBedPrice.toFixed(2) + ' €' : '—'}</td>
                                            <td className="py-2 px-3 text-right">{c.total.toFixed(2)} €</td>
                                        </tr>
                                    ))}
                                    {informe.clientes.length === 0 && (
                                        <tr><td colSpan={7} className="py-4 px-3 text-center text-gray text-sm">Sin facturas en este periodo</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <button onClick={() => setShowProveedores(v => !v)}
                        className="text-xs text-gray hover:text-gray-dark transition-colors underline block mb-2">
                        {showProveedores ? 'Ocultar detalle de proveedores' : `Ver detalle de proveedores (${informe.proveedores.length})`}
                    </button>
                    {showProveedores && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-light">
                                        <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Nº Factura</th>
                                        <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Fecha</th>
                                        <th className="text-right py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Importe total</th>
                                        <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Beneficiario</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {informe.proveedores.map((p, i) => (
                                        <tr key={i} className="border-b border-gray-light last:border-0">
                                            <td className="py-2 px-3 text-gray-dark font-medium">{p.invoiceNumber ?? '—'}</td>
                                            <td className="py-2 px-3">{new Date(p.date).toLocaleDateString('es-ES')}</td>
                                            <td className="py-2 px-3 text-right">{p.totalAmount.toFixed(2)} €</td>
                                            <td className="py-2 px-3">{p.supplierName}</td>
                                        </tr>
                                    ))}
                                    {informe.proveedores.length === 0 && (
                                        <tr><td colSpan={4} className="py-4 px-3 text-center text-gray text-sm">Sin facturas en este periodo</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
