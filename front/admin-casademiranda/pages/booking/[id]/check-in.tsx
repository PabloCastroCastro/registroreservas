import { useRouter } from 'next/router'
import Navbar from '@/components/navbar/navbar'
import type { Booking } from '@/interfaces/booking'
import type { Client } from '@/interfaces/client'

import { useState, useEffect } from 'react';
import * as APIBooking from "@/services/bookings";
import * as APIClient from "@/services/clients";

import { Button } from 'flowbite-react';
import Link from 'next/link'
import ClientComponent from '@/components/clients/clientComponent';
import DateComponent from '@/components/dates/dateComponent';

export default function CheckInPage() {

    const [booking, setBooking] = useState<Booking>();
    const [clients, setClients] = useState<Client[]>();

    const { query } = useRouter()

    useEffect(() => {
        APIBooking.getBookingById(query.id).then(setBooking).catch(console.log);
        query.id !== undefined && typeof query.id === "string" ? APIClient.getClientsByBookingId(query.id).then(setClients).catch(console.log) : setClients([]);
    }, []);

    return (
        <>
            <Navbar />
            {booking ? (
                <div>
                    <div id="titulo" className='ml-5'>
                        <h1 className='relative text-xl text-green text-opacity-75 font-semibold'>Reserva:</h1>
                    </div>
                    <div id="datos-reserva" className='mt-5 ml-10 grid grid-cols-1 gap-2'>
                        <div id="datos-comunes" className='grid grid-cols-3 gap-3'>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="nombre">Nombre: {booking?.name}</label>
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="apellidos">Apellidos: {booking?.surname}</label>
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="dni">Dni: {booking?.identifier}</label>
                            </div>
                            <div className="grid grid-cols-1">
                                <DateComponent label="Fecha check_in: " date={booking?.check_in} />
                            </div>
                            <div className="grid grid-cols-1">
                                <DateComponent label="Fecha check_out: " date={booking?.check_out} />
                            </div>
                        </div>
                        <div id="datos-clientes" className='grid grid-cols-3 gap-3'>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="clientes">Clientes registrados:</label>
                            </div>
                            <div className="grid grid-cols-1"></div>
                            <div className="grid grid-cols-1"></div>
                            {clients ? clients.map(client => (<ClientComponent client={{ ...client, booking_id: booking.booking_id }}></ClientComponent>)) : <></>}
                        </div>
                    </div>
                    <div id="botones" className='mt-5 ml-5 grid grid-cols-6 gap-3'>
                        <div className="grid grid-cols-1">
                            <Link className='rounded-full bg-green bg-opacity-50 hover:bg-gray-dark text-center text-gray-dark text-opacity-75 px-5 py-2.5' href={"/client/new-client?booking_id=" + booking.booking_id}><label>Registrar nuevo cliente</label></Link>
                        </div>
                    </div>
                </div>
            ) : <></>}

        </>
    )
}