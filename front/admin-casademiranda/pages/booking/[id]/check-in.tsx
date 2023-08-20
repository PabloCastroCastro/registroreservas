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
                    <h1>Datos Reserva:</h1>
                    <p>Nombre: {booking.name}</p>
                    <p>Apellidos: {booking.surname}</p>
                    <p>Dni: {booking.identifier}</p>
                    <DateComponent dateProps={{ label: "Check In: ", date: booking.check_in }}></DateComponent>
                    <DateComponent dateProps={{ label: "Check Out: ", date: booking.check_out }}></DateComponent>
                    <p>Lista clientes registrados:</p>
                    {clients ? clients.map(client => (<ClientComponent client={{ ...client, booking_id: booking.booking_id }}></ClientComponent>)) : <></>}
                    <Link href={"/client/new-client?booking_id=" + booking.booking_id}><Button>Registrar nuevo cliente</Button></Link>
                </div>
            ) : <></>}

        </>
    )
}