'use client';
import React, { Suspense } from "react";
import './bookings.css'
import { Button, TextInput } from 'flowbite-react';
import { useState, useEffect } from 'react';
import * as API from "../../services/bookings";


export default function Bookings() {

    const [identifier, setIdentifier] = useState("Dni...");
    const [bookings, setBookings] = useState([]);

    function find() {
        alert(identifier);
        API.getBookingByIdentifier(identifier).then(setBookings).catch(console.log);
    }

    useEffect(() => {
        API.getAllBookings().then(setBookings).catch(console.log);
    }, []);


    return (
        <div>
            <div className="flex flex-row">
                <div className='basis-2/4'></div>
                <TextInput id="small" className="basis-1/4" sizing="sm" type="text" name="identifier" defaultValue="DNI..." value={identifier} onChange={identifier => setIdentifier(identifier.target.value)}></TextInput>
                <Button className="basis-1/4" size="sm" onClick={find}>Buscar</Button>
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
                                <tr>
                                    <td>{item.booking_id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.surname}</td>
                                    <td>
                                        <table>
                                            {item.rooms?.map((room) => (
                                                <tbody>
                                                    <tr>
                                                        <td>{room.name}</td>
                                                        <td>{room.extra_beds}</td>
                                                    </tr>
                                                </tbody>
                                            ))}
                                        </table>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Suspense>
            </div>
        </div>
    );
}