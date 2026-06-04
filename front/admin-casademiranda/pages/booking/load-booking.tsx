import "@/app/globals.css";
import React, { useState, ChangeEvent } from "react";
import Navbar from "@/components/navbar/navbar";
import * as APIBooking from "../../services/bookings";
import { useSyncStatus } from "../../hooks/useSyncStatus";
import SyncIndicator from "../../components/sync/SyncIndicator";

type PendingEmail = { uid: number; subject: string; from: string; date: string };

type ImportResult = {
    message: string;
    reservasCreadas: number;
    reservasOmitidas: number;
    errores: { referencia: string; error: string }[];
};

export default function LoadBooking() {
    const sync = useSyncStatus();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [checkingMail, setCheckingMail] = useState(false);
    const [pendingEmails, setPendingEmails] = useState<PendingEmail[] | null>(null);
    const [mailError, setMailError] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setResult(null);
            setError(null);
        }
    };

    const handleCheckMail = async () => {
        setCheckingMail(true);
        setMailError(null);
        setPendingEmails(null);
        try {
            const res = await APIBooking.checkBookingSync();
            setPendingEmails(res.emails ?? []);
            if (res.hasPending) sync.setForcedRed();
        } catch (err: any) {
            setMailError(err?.message ?? 'Error desconocido');
        } finally {
            setCheckingMail(false);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Selecciona un archivo primero");
            return;
        }
        setLoading(true);
        setResult(null);
        setError(null);
        try {
            const res = await APIBooking.loadBookingBatch(file);
            if (typeof res === 'object' && res !== null) {
                setResult(res as ImportResult);
                sync.markSynced();
                setPendingEmails(null);
                APIBooking.markBookingSyncRead().catch(console.error);
            } else {
                setError("Respuesta inesperada del servidor");
            }
        } catch (err) {
            setError("Error al procesar el archivo");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="px-4 md:px-10 mt-5">
                <h1 className="text-xl text-green text-opacity-75 font-semibold mb-3">Cargar reservas desde Booking</h1>

                <div className="mb-5">
                    <SyncIndicator sync={sync} showForceButton={true} />
                </div>

                {/* Comprobación de emails */}
                <section className="border border-gray-light rounded-lg p-4 max-w-xl mb-4">
                    <h2 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">Emails de Booking</h2>
                    <p className="text-sm text-gray mb-3">
                        Comprueba si hay emails no leídos de Booking.com en la bandeja de entrada.
                    </p>
                    <button
                        onClick={handleCheckMail}
                        disabled={checkingMail}
                        className="rounded-full bg-gray-light px-5 py-2 text-sm font-semibold text-gray-dark disabled:opacity-40"
                    >
                        {checkingMail ? 'Comprobando...' : 'Comprobar emails'}
                    </button>

                    {mailError && <p className="mt-2 text-sm text-orange">{mailError}</p>}

                    {pendingEmails !== null && (
                        <div className="mt-3">
                            {pendingEmails.length === 0 ? (
                                <p className="text-sm text-green">No hay emails pendientes de Booking.com</p>
                            ) : (
                                <>
                                    <p className="text-sm font-medium text-orange mb-2">
                                        {pendingEmails.length} email(s) sin leer de Booking.com:
                                    </p>
                                    <ul className="space-y-1">
                                        {pendingEmails.map((e, i) => (
                                            <li key={i} className="text-xs border border-gray-light rounded px-2 py-1">
                                                <span className="font-medium text-gray-dark">{e.subject}</span>
                                                <span className="text-gray ml-2">{new Date(e.date).toLocaleDateString('es-ES')}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    )}
                </section>

                <section className="border border-gray-light rounded-lg p-4 max-w-xl">
                    <h2 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">Archivo Excel</h2>
                    <p className="text-sm text-gray mb-4">
                        Exporta las reservas desde el extranet de Booking.com y sube el archivo <span className="font-medium">.xlsx</span> aquí.
                    </p>

                    <label className="block">
                        <span className="text-xs text-gray uppercase tracking-wide block mb-1">Seleccionar archivo</span>
                        <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-dark border border-gray-light rounded-lg px-3 py-2 cursor-pointer"
                        />
                    </label>

                    {file && (
                        <p className="mt-2 text-xs text-gray">
                            Archivo seleccionado: <span className="font-medium text-gray-dark">{file.name}</span>
                        </p>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="mt-4 rounded-full bg-green bg-opacity-50 px-6 py-2 font-semibold text-gray-dark disabled:opacity-40"
                    >
                        {loading ? 'Procesando...' : 'Importar reservas'}
                    </button>
                </section>

                {/* Resultado */}
                {result && (
                    <section className="mt-4 border border-gray-light rounded-lg p-4 max-w-xl">
                        <h2 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">Resultado</h2>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="border border-gray-light rounded-lg p-3 text-center">
                                <p className="text-2xl font-semibold text-green">{result.reservasCreadas}</p>
                                <p className="text-xs text-gray mt-1">Reservas importadas</p>
                            </div>
                            <div className="border border-gray-light rounded-lg p-3 text-center">
                                <p className="text-2xl font-semibold text-gray">{result.reservasOmitidas}</p>
                                <p className="text-xs text-gray mt-1">Ya existían (omitidas)</p>
                            </div>
                        </div>
                        {result.errores.length > 0 && (
                            <div>
                                <p className="text-xs text-orange font-semibold uppercase tracking-wide mb-2">
                                    {result.errores.length} error(es)
                                </p>
                                <ul className="text-xs text-gray-dark space-y-1">
                                    {result.errores.map((e, i) => (
                                        <li key={i} className="border border-gray-light rounded px-2 py-1">
                                            <span className="font-medium">{e.referencia}</span>: {e.error}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>
                )}

                {error && (
                    <p className="mt-4 text-sm text-orange">{error}</p>
                )}
            </div>
        </>
    );
}
