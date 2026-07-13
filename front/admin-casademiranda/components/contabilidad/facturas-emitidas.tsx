import { useEffect, useState } from 'react';
import { listInvoices, viewInvoicePdf, resendInvoice } from '@/services/invoices';
import type { Invoice } from '@/interfaces/invoice';

const inputClass = "mt-1 w-full border border-gray-light rounded-lg px-3 py-2 text-gray-dark text-sm focus:outline-none focus:border-gray";
const labelClass = "text-xs text-gray uppercase tracking-wide block";

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);
const QUARTERS = [1, 2, 3, 4];

function currentQuarter() {
    return Math.ceil((new Date().getMonth() + 1) / 3);
}

export default function FacturasEmitidas() {
    const [year, setYear] = useState(currentYear);
    const [quarter, setQuarter] = useState(currentQuarter());
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [resendingId, setResendingId] = useState<string | null>(null);

    useEffect(() => { load(); }, [year, quarter]);

    async function load() {
        setLoading(true);
        setError('');
        try {
            setInvoices(await listInvoices(year, quarter));
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleView(confirmationNumber: string) {
        try {
            const blob = await viewInvoicePdf(confirmationNumber);
            window.open(URL.createObjectURL(blob), '_blank');
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    }

    async function handleResend(confirmationNumber: string) {
        if (!confirm(`¿Reenviar la factura ${confirmationNumber} por email?`)) return;
        setResendingId(confirmationNumber);
        try {
            await resendInvoice(confirmationNumber);
            alert('Factura reenviada.');
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        } finally {
            setResendingId(null);
        }
    }

    const total = invoices.reduce((sum, i) => sum + i.total, 0);

    return (
        <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 max-w-lg">
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
                                <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Huésped</th>
                                <th className="text-left py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Fecha checkout</th>
                                <th className="text-right py-2 px-3 text-xs text-gray uppercase tracking-wide font-semibold">Total</th>
                                <th className="py-2 px-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map(inv => (
                                <tr key={inv.confirmationNumber} className="border-b border-gray-light last:border-0">
                                    <td className="py-2 px-3 text-gray-dark font-medium">{inv.confirmationNumber}</td>
                                    <td className="py-2 px-3">{inv.guest}</td>
                                    <td className="py-2 px-3">{new Date(inv.checkOut).toLocaleDateString('es-ES')}</td>
                                    <td className="py-2 px-3 text-right">{inv.total.toFixed(2)} €</td>
                                    <td className="py-2 px-3 text-right whitespace-nowrap">
                                        <button onClick={() => handleView(inv.confirmationNumber)}
                                            className="text-gray hover:text-gray-dark transition-colors text-xs font-semibold mr-3">
                                            Ver PDF
                                        </button>
                                        <button onClick={() => handleResend(inv.confirmationNumber)}
                                            disabled={resendingId === inv.confirmationNumber}
                                            className="text-gray hover:text-green transition-colors text-xs font-semibold disabled:opacity-40">
                                            {resendingId === inv.confirmationNumber ? 'Enviando...' : 'Reenviar email'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr><td colSpan={5} className="py-4 px-3 text-center text-gray text-sm">Sin facturas en este periodo</td></tr>
                            )}
                        </tbody>
                        {invoices.length > 0 && (
                            <tfoot>
                                <tr>
                                    <td colSpan={3} className="py-2 px-3 text-right text-xs text-gray uppercase tracking-wide font-semibold">Total periodo</td>
                                    <td className="py-2 px-3 text-right font-semibold text-gray-dark">{total.toFixed(2)} €</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            )}
        </div>
    );
}
