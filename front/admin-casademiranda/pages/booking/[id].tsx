import Navbar from '../../components/navbar/navbar'
import RoomComponent from '@/components/rooms/roomComponent';
import { useRouter } from 'next/router'
import type { Booking, ResponseError } from '../../interfaces/booking'
import type { Bill } from '@/interfaces/bill'
import * as APIBooking from "../../services/bookings";
import * as APIBilling from "../../services/bills";
import { useState, useEffect } from 'react';
import { Button } from 'flowbite-react';
import { RequestRoom } from '@/interfaces/room';
import Link from 'next/link'
import DateComponent from '@/components/dates/DateComponent';

export default function BookingPage() {
    const { query } = useRouter()
    const [booking, setBooking] = useState<Booking>();
    const [billStatus, setBillStatus] = useState(200);

    useEffect(() => {
        APIBooking.getBookingById(query.id).then(setBooking).catch(console.log);
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
            </div>
            <div id="botones" className='mt-5 ml-5 grid grid-cols-6 gap-3'>
                    <div className="grid grid-cols-1">
                        <Button className='rounded-full bg-green bg-opacity-50 text-gray-dark text-opacity-75' onClick={createBill}>Generar Factura</Button>
                    </div>
                    <div className="grid grid-cols-1">
                        <Link className='rounded-full bg-green bg-opacity-50 hover:bg-gray-dark text-center text-gray-dark text-opacity-75 px-5 py-2.5' href="/booking/[id]/check-in" as={`/booking/${booking?.booking_id}/check-in`}><label>Check In</label></Link>
                    </div>
                    <div className="grid grid-cols-1"></div>
            </div>
        </>
    )
}