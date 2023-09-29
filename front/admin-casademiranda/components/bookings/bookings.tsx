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
                <div className='basis-6/12'></div>
                <TextInput className="basis-4/12" type="text" name="identifier" value={identifier} onChange={identifier => setIdentifier(identifier.target.value)}></TextInput>
                <button className="basis-2/12 rounded-full bg-green bg-opacity-50" onClick={find}><p className="text-black text-opacity-75 font-semibold">Buscar</p></button>
            </div>
            <div id="divTable">
                <Suspense fallback={<div>Loading...</div>}>
                    <table id="bookingTable">
                        <thead>
                            <tr>
                                <th><p className="text-black text-opacity-75 font-semibold">Reserva</p></th>
                                <th><p className="text-black text-opacity-75 font-semibold">Nombre</p></th>
                                <th><p className="text-black text-opacity-75 font-semibold">Apellidos</p></th>
                                <th><p className="text-black text-opacity-75 font-semibold">Habitaciones</p></th>
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