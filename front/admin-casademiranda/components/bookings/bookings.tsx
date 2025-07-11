'use client';
import React, { Suspense } from "react";
import './bookings.css'
import { Button, TextInput } from 'flowbite-react';
import { useState, useEffect } from 'react';
import type { Booking } from '../../interfaces/booking'
import Link from 'next/link';


import * as API from "../../services/bookings";
import BookingComponent from "./bookingComponent";
import Navbar from "../navbar/navbar";


export default function Bookings() {

    const [token, setToken] = useState<string | null>(null);
    const [identifier, setIdentifier] = useState("Dni...");
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);



    function find() {
        API.getBookingByIdentifier(identifier)
            .then((data: Booking[]) => {
                const filteredAndSorted = data
                    .filter(booking => {
                        const checkIn = new Date(booking.check_in);
                        const baseDate = new Date(filterDate);
                        return checkIn >= baseDate && booking.state === 'ok';
                    })
                    .sort((a, b) =>
                        new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
                    );
                setBookings(filteredAndSorted);
            })
            .catch(console.log);
    }

    useEffect(() => {
        const tokenGuardado = localStorage.getItem('token');
        if (tokenGuardado) {
            setToken(tokenGuardado);
        }

        API.getAllBookings()
            .then((data: Booking[]) => {
                const filteredAndSorted = data
                    .filter(booking => {
                        const checkIn = new Date(booking.check_in);
                        const baseDate = new Date(filterDate);
                        return checkIn > baseDate && booking.state === 'ok';
                    })
                    .sort((a, b) =>
                        new Date(a.check_in).getTime() - new Date(b.check_in).getTime()
                    );
                setBookings(filteredAndSorted);
            })
            .catch(console.log);
    }, [filterDate]);

    return (
        <>
            <div className="mt-5 ml-10 grid grid-cols-7 gap-3">
                <TextInput className="col-span-1" type="text" name="identifier" value={identifier} onChange={identifier => setIdentifier(identifier.target.value)}></TextInput>
                <div className="col-span-1 grid grid-cols-3">
                    <button className="col-start-1 col-span-1 rounded-full bg-green bg-opacity-50" onClick={find}>
                        <p className="text-black text-opacity-75 font-semibold">Buscar</p>
                    </button>
                </div>
                <TextInput
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="col-span-1"
                />
            </div>
            <div id="divTable">
                <Suspense fallback={<div>Loading...</div>}>
                    <table className="m-10" id="bookingTable">
                        <thead>
                            <tr>
                                <th><p className="text-black text-opacity-75 font-semibold">Reserva</p></th>
                                <th><p className="text-black text-opacity-75 font-semibold">Check-in</p></th>
                                <th><p className="text-black text-opacity-75 font-semibold">Estado</p></th>
                                <th><p className="text-black text-opacity-75 font-semibold">Nombre</p></th>
                                <th><p className="text-black text-opacity-75 font-semibold">Apellidos</p></th>
                                <th><p className="text-black text-opacity-75 font-semibold">Habitaciones</p></th>
                                <th><p className="text-black text-opacity-75 font-semibold">Código Booking</p></th>
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