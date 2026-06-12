'use client';

import "@/app/globals.css";
import Navbar from '@/components/navbar/navbar';
import * as APIBooking from '@/services/bookings';
import type { CheckInPreview } from '@/services/bookings';
import { useState, useEffect } from 'react';

const labelClass = 'text-xs text-gray uppercase tracking-wide font-semibold';

export default function CheckInXmlPage() {
    const [fecha, setFecha] = useState(() => new Date().toISOString().split('T')[0]);
    const [preview, setPreview] = useState<CheckInPreview | null>(null);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadPreview(fecha);
    }, [fecha]);

    async function loadPreview(f: string) {
        setLoading(true);
        setError(null);
        try {
            const data = await APIBooking.getCheckInPreview(f);
            setPreview(data);
        } catch (err: any) {
            setError(err?.message ?? 'Error desconocido');
            setPreview(null);
        } finally {
            setLoading(false);
        }
    }

    async function handleDownload() {
        if (!preview || preview.total === 0) return;
        setDownloading(true);
        try {
            const blob = await APIBooking.downloadCheckInXml(fecha);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `checkin_${fecha}.xml`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.message ?? 'Error al descargar');
        } finally {
            setDownloading(false);
        }
    }

    return (
        <>
            <Navbar />
            <div className="max-w-2xl mx-auto px-4 mt-8">

                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-dark">Check-in XML</h1>
                        <p className="text-sm text-gray mt-0.5">Comunicación de viajeros al Ministerio del Interior</p>
                    </div>
                    <button
                        onClick={handleDownload}
                        disabled={downloading || loading || !preview || preview.total === 0}
                        className="rounded-lg bg-green bg-opacity-50 px-5 py-2.5 text-sm font-semibold text-gray-dark disabled:opacity-40"
                    >
                        {downloading ? 'Descargando...' : 'Descargar XML'}
                    </button>
                </div>

                {/* Selector de fecha */}
                <div className="border border-gray-light rounded-xl p-4 mb-4 flex items-center gap-4">
                    <span className={labelClass}>Fecha check-in</span>
                    <input
                        type="date"
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                        className="border border-gray-light rounded-lg px-3 py-2 text-sm text-gray-dark focus:outline-none focus:border-gray"
                    />
                    {preview && !loading && (
                        <span className="ml-auto text-sm text-gray">
                            {preview.total === 0
                                ? 'Sin check-ins'
                                : `${preview.total} comunicación${preview.total > 1 ? 'es' : ''}`}
                        </span>
                    )}
                </div>

                {/* Contenido */}
                {error && (
                    <p className="text-sm text-orange text-center py-8">{error}</p>
                )}

                {loading && (
                    <p className="text-sm text-gray text-center py-8">Cargando...</p>
                )}

                {!loading && !error && preview && preview.total === 0 && (
                    <p className="text-sm text-gray text-center py-8">No hay check-ins registrados para esta fecha.</p>
                )}

                {!loading && !error && preview && preview.total > 0 && (
                    <div className="space-y-3">
                        {preview.comunicaciones.map(com => (
                            <div key={com.referencia} className="border border-gray-light rounded-xl p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-dark">#{com.referencia}</p>
                                        <p className="text-xs text-gray mt-0.5">
                                            {new Date(com.check_in).toLocaleDateString('es-ES')} →{' '}
                                            {new Date(com.check_out).toLocaleDateString('es-ES')}
                                            {' · '}{com.habitaciones} hab.
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray bg-gray-light bg-opacity-50 rounded-full px-2.5 py-1">
                                        {com.personas.length} viajero{com.personas.length !== 1 ? 's' : ''}
                                    </span>
                                </div>
                                <ul className="space-y-1.5">
                                    {com.personas.map((p, i) => (
                                        <li key={i} className="flex items-center justify-between bg-gray-light bg-opacity-30 rounded-lg px-3 py-2 text-sm">
                                            <span className="font-medium text-gray-dark">
                                                {p.nombre} {p.apellido1}{p.apellido2 ? ` ${p.apellido2}` : ''}
                                            </span>
                                            <span className="text-xs text-gray ml-2 shrink-0">
                                                {p.tipoDocumento} · {p.numeroDocumento}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
