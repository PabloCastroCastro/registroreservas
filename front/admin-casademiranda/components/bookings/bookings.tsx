'use client';
import React, { Suspense } from "react";
import './bookings.css'
import { Button, TextInput } from 'flowbite-react';
import { useState, useEffect } from 'react';
import type { Booking } from '../../interfaces/booking'
import Link from 'next/link';


import * as API from "../../services/bookings";
import BookingComponent from "./bookingComponent";
import BookingCalendar from "./bookingCalendar";
import Navbar from "../navbar/navbar";


export default function Bookings() {

    const [token, setToken] = useState<string | null>(null);
    const [identifier, setIdentifier] = useState("Dni...");
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filterDate, setFilterDate] = useState<string>(
        () => localStorage.getItem('bookings_filterDate') ?? new Date().toISOString().split('T')[0]
    );
    const [showCancelled, setShowCancelled] = useState<boolean>(
        () => localStorage.getItem('bookings_showCancelled') === 'true'
    );
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>(
        () => (localStorage.getItem('bookings_viewMode') as 'list' | 'calendar') ?? 'list'
    );



    function filterBookings(data: Booking[], fromToday: boolean) {
        return data
            .filter(booking => {
                const checkIn = new Date(booking.check_in);
                const baseDate = new Date(filterDate);
                const dateOk = fromToday ? checkIn > baseDate : checkIn >= baseDate;
                return dateOk && (showCancelled ? booking.state === 'cancelada' : booking.state === 'ok');
            })
            .sort((a, b) => new Date(a.check_in).getTime() - new Date(b.check_in).getTime());
    }

    function find() {
        API.getBookingByIdentifier(identifier)
            .then((data: Booking[]) => setBookings(filterBookings(data, false)))
            .catch(console.log);
    }

    useEffect(() => {
        const tokenGuardado = localStorage.getItem('token');
        if (tokenGuardado) setToken(tokenGuardado);

        API.getAllBookings()
            .then((data: Booking[]) => {
                setAllBookings(data);
                setBookings(filterBookings(data, true));
            })
            .catch(console.log);
    }, [filterDate, showCancelled]);

    return (
        <>
            <div className="mt-5 px-4 md:px-10 flex flex-col md:flex-row md:flex-wrap gap-3 items-stretch md:items-center">
                <TextInput className="w-full md:w-48" type="text" name="identifier" value={identifier} onChange={identifier => setIdentifier(identifier.target.value)} />
                <button className="w-full md:w-auto rounded-full bg-green bg-opacity-50 py-2 px-5" onClick={find}>
                    <p className="text-black text-opacity-75 font-semibold">Buscar</p>
                </button>
                <TextInput
                    type="date"
                    value={filterDate}
                    onChange={(e) => {
                        setFilterDate(e.target.value);
                        localStorage.setItem('bookings_filterDate', e.target.value);
                    }}
                    className="w-full md:w-auto"
                />
                <label className="flex items-center gap-2 text-gray-dark text-opacity-75 cursor-pointer py-2">
                    <input
                        type="checkbox"
                        checked={showCancelled}
                        onChange={(e) => {
                            setShowCancelled(e.target.checked);
                            localStorage.setItem('bookings_showCancelled', String(e.target.checked));
                        }}
                        className="w-4 h-4"
                    />
                    Ver canceladas
                </label>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setViewMode('list'); localStorage.setItem('bookings_viewMode', 'list'); }}
                        className={`flex-1 md:flex-none rounded-full px-4 py-2 font-semibold text-sm ${viewMode === 'list' ? 'bg-green bg-opacity-50' : 'bg-gray-light'}`}
                    >
                        Lista
                    </button>
                    <button
                        onClick={() => { setViewMode('calendar'); localStorage.setItem('bookings_viewMode', 'calendar'); }}
                        className={`flex-1 md:flex-none rounded-full px-4 py-2 font-semibold text-sm ${viewMode === 'calendar' ? 'bg-green bg-opacity-50' : 'bg-gray-light'}`}
                    >
                        Calendario
                    </button>
                </div>
            </div>
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