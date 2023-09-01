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

    const [identifier, setIdentifier] = useState("Dni...");
    const [bookings, setBookings] = useState([]);

    function find() {
        API.getBookingByIdentifier(identifier).then(setBookings).catch(console.log);
    }

    useEffect(() => {
        API.getAllBookings().then(setBookings).catch(console.log);
    }, []);


    return (
        <>
            <div className="flex flex-row">
            <Link href="/booking/new-booking"><button className="basis-1/4 rounded-full bg-blue">Crear Reserva</button></Link>
                <div className='basis-1/4'></div>
                <TextInput className="basis-1/4" type="text" name="identifier" value={identifier} onChange={identifier => setIdentifier(identifier.target.value)}></TextInput>
                <button className="basis-1/4 rounded-full bg-blue" onClick={find}>Buscar</button>
            </div>
            <div id="divTable">
                <Suspense fallback={<div>Loading...</div>}>
                    <table id="bookingTable">
                        <thead>
                            <tr>
                                <th>Reserva</th>
                                <th>Nombre</th>
                                <th>Apellidos</th>
                                <th>Habitaciones</th>
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