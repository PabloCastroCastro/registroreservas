import Navbar from '../../components/navbar/navbar'
import RoomComponent from '@/components/rooms/roomComponent';
import { useRouter } from 'next/router'
import type { Booking, ResponseError } from '../../interfaces/booking'
import type { Bill } from '@/interfaces/bill'
import * as APIBooking from "../../services/bookings";
import * as APIBilling from "../../services/bills";
import * as APIClient from "@/services/clients";
import { useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import { RequestRoom } from '@/interfaces/room';
import Link from 'next/link'
import { Client } from '@/interfaces/client';
import ClientComponent from '@/components/clients/clientComponent';
import DateComponent from '@/components/dates/dateComponent';

export default function BookingPage() {
    const { query } = useRouter()
    const [booking, setBooking] = useState<Booking>();
    const [clients, setClients] = useState<Client[]>();
    const [billStatus, setBillStatus] = useState(200);

    useEffect(() => {
        APIBooking.getBookingById(query.id).then(setBooking).catch(console.log);
        query.id !== undefined && typeof query.id === "string" ? APIClient.getClientsByBookingId(query.id).then(setClients).catch(console.log) : setClients([]);
    }, []);

    function createBill() {

        let bill: Bill = {
            numeroFactura: "",
            nombre: booking ? booking.name : "",
            apellidos: booking ? booking.surname : "",
            dni: booking ? booking.identifier : "",
            email: "casademirandaezaro@gmail.com",
            fechaCheckIn: booking ? booking.check_in.toLocaleString() : new Date().toLocaleString(),
            fechaCheckOut: booking ? booking.check_out.toLocaleString() : new Date().toLocaleString(),
            habitaciones: booking ? booking.rooms.map(room => {
                let roomBill: RequestRoom = {
                    habitacion: room.name,
                    precio: room.price,
                    supletorias: room.extra_beds ? room.extra_beds : 0,
                    precioSupletoria: room.extra_beds ? room.price_extra_bed : 0
                }
                return roomBill;
            }) : []

        }

        APIBilling.createBill(bill).then(setBillStatus).catch(console.log);
    }

    return (
        <>
            <Navbar />
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
                    <div className="grid grid-cols-1"></div>
                </div>
                <div id="datos-habitaciones" className='grid grid-cols-3 gap-3'>
                    <div className="grid grid-cols-1">
                        <label className='text-gray-dark text-opacity-75' id="habitaciones">Habitaciones:</label>
                    </div>
                    <div className="grid grid-cols-1"></div>
                    <div className="grid grid-cols-1"></div>
                    {booking?.rooms.map(r => (<div className="grid grid-cols-1"><RoomComponent room={r} /></div>))}
                </div>
                <div id="datos-clientes" className='grid grid-cols-3 gap-3'>
                    <div className="grid grid-cols-1">
                        <label className='text-gray-dark text-opacity-75' id="clientes">Huespedes:</label>
                    </div>
                    <div className="grid grid-cols-1"></div>
                    <div className="grid grid-cols-1"></div>
                    {clients && booking ? clients.map(client => (<ClientComponent client={{ ...client, booking_id: booking.booking_id }}></ClientComponent>)) : <></>}
                    <div className="grid grid-cols-1">
                        <Link className='w-12 h-12 rounded-full bg-green bg-opacity-50 hover:bg-gray-dark text-center text-gray-dark text-opacity-75' href={"/client/new-client?booking_id=" + booking?.booking_id}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
            <div id="botones" className='mt-5 ml-5 grid grid-cols-6 gap-3'>
                    <div className="grid grid-cols-1">
                        <Button className='rounded-full bg-green bg-opacity-50 text-gray-dark text-opacity-75' onClick={createBill}>Generar Factura</Button>
                    </div>
            </div>
        </>
    )
}