'use client';
import React, { Suspense } from "react";
import './bookings.css'
import { useState, useEffect } from 'react';
import type { Booking } from '../../interfaces/booking'
import Link from 'next/link';


import * as API from "../../services/bookings";
import BookingComponent from "./bookingComponent";
import BookingCalendar from "./bookingCalendar";
import Navbar from "../navbar/navbar";
import { useSyncStatus } from "../../hooks/useSyncStatus";
import SyncIndicator from "../sync/SyncIndicator";


export default function Bookings() {

    const sync = useSyncStatus();
    const [token, setToken] = useState<string | null>(null);
    const [identifier, setIdentifier] = useState("Dni...");
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [searchResults, setSearchResults] = useState<Booking[] | null>(null);
    const [filterDate, setFilterDate] = useState<string>(
        () => localStorage.getItem('bookings_filterDate') ?? new Date().toISOString().split('T')[0]
    );
    const [showCancelled, setShowCancelled] = useState<boolean>(
        () => localStorage.getItem('bookings_showCancelled') === 'true'
    );
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>(
        () => (localStorage.getItem('bookings_viewMode') as 'list' | 'calendar') ?? 'list'
    );

    // Derivado reactivamente — nunca hay stale closures
    const sourceData = searchResults ?? allBookings;
    const bookings = sourceData
        .filter(b => {
            if (b.state !== 'ok') return showCancelled;
            const checkIn = new Date(b.check_in);
            const baseDate = new Date(filterDate);
            return searchResults ? checkIn >= baseDate : checkIn > baseDate;
        })
        .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime());

    function find() {
        API.getBookingByIdentifier(identifier)
            .then((data: Booking[]) => setSearchResults(data))
            .catch(console.log);
    }

    useEffect(() => {
        const tokenGuardado = localStorage.getItem('token');
        if (tokenGuardado) setToken(tokenGuardado);
        API.getAllBookings()
            .then(data => setAllBookings(data))
            .catch(console.log);
    }, []);

    return (
        <>
            <div className="mt-4 mx-4 md:mx-10 border border-gray-light rounded-xl p-4 flex flex-col md:flex-row md:flex-wrap gap-4 items-stretch md:items-center">

                {/* Búsqueda por DNI */}
                <div className="flex gap-2 flex-1 min-w-0">
                    <input
                        type="text"
                        placeholder="Buscar por DNI..."
                        value={identifier === 'Dni...' ? '' : identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && find()}
                        className="flex-1 min-w-0 border border-gray-light rounded-lg px-3 py-2 text-sm text-gray-dark focus:outline-none focus:border-gray"
                    />
                    <button
                        onClick={find}
                        className="rounded-lg bg-green bg-opacity-50 px-4 py-2 text-sm font-semibold text-gray-dark whitespace-nowrap"
                    >
                        Buscar
                    </button>
                    {searchResults && (
                        <button
                            onClick={() => setSearchResults(null)}
                            className="rounded-lg bg-gray-light px-3 py-2 text-sm font-semibold text-gray"
                            title="Limpiar búsqueda"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Separador vertical (solo desktop) */}
                <div className="hidden md:block w-px h-8 bg-gray-light self-center" />

                {/* Filtro de fecha */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray uppercase tracking-wide whitespace-nowrap">Desde</span>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => {
                            setFilterDate(e.target.value);
                            localStorage.setItem('bookings_filterDate', e.target.value);
                        }}
                        className="border border-gray-light rounded-lg px-3 py-2 text-sm text-gray-dark focus:outline-none focus:border-gray"
                    />
                </div>

                {/* Separador vertical (solo desktop) */}
                <div className="hidden md:block w-px h-8 bg-gray-light self-center" />

                {/* Checkbox canceladas */}
                <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                    <input
                        type="checkbox"
                        checked={showCancelled}
                        onChange={e => {
                            setShowCancelled(e.target.checked);
                            localStorage.setItem('bookings_showCancelled', String(e.target.checked));
                        }}
                        className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-dark">Ver canceladas</span>
                </label>

                {/* Vista lista/calendario */}
                <div className="flex gap-1 ml-auto">
                    <button
                        onClick={() => { setViewMode('list'); localStorage.setItem('bookings_viewMode', 'list'); }}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${viewMode === 'list' ? 'bg-green bg-opacity-50 text-gray-dark' : 'bg-gray-light text-gray hover:text-gray-dark'}`}
                    >
                        Lista
                    </button>
                    <button
                        onClick={() => { setViewMode('calendar'); localStorage.setItem('bookings_viewMode', 'calendar'); }}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${viewMode === 'calendar' ? 'bg-green bg-opacity-50 text-gray-dark' : 'bg-gray-light text-gray hover:text-gray-dark'}`}
                    >
                        Calendario
                    </button>
                </div>
            </div>

            {(sync.status === 'warning' || sync.status === 'danger' || sync.status === 'never') && (
                <div className="px-4 md:px-10 mt-3">
                    <SyncIndicator sync={sync} showForceButton={false} />
                </div>
            )}
            {viewMode === 'calendar' && (
                <BookingCalendar bookings={allBookings} showCancelled={showCancelled} />
            )}
            <div id="divTable" className="overflow-x-auto" style={{ display: viewMode === 'list' ? 'block' : 'none' }}>
                <Suspense fallback={<div>Loading...</div>}>
                    <table className="m-10" id="bookingTable">
                        <thead>
                            <tr>
                                <th><p className="text-black text-opacity-75 font-semibold">Reserva</p></th>
                                <th><p className="text-black text-opacity-75 font-semibold">Check-in</p></th>
                                <th className="hidden md:table-cell"><p className="text-black text-opacity-75 font-semibold">Estado</p></th>
                                <th><p className="text-black text-opacity-75 font-semibold">Nombre</p></th>
                                <th className="hidden md:table-cell"><p className="text-black text-opacity-75 font-semibold">Apellidos</p></th>
                                <th className="hidden md:table-cell"><p className="text-black text-opacity-75 font-semibold">Habitaciones</p></th>
                                <th className="hidden md:table-cell"><p className="text-black text-opacity-75 font-semibold">Código Booking</p></th>
                            </tr>
                        </thead>
                        <tbody id="tBodyBookings">
                            {bookings?.map((item) => (
                                <BookingComponent key={item.booking_id} booking={item} />
                            ))}
                        </tbody>
                    </table>
                </Suspense>
            </div>
        </>
    );
}