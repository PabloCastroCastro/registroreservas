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
                    supletorias: room.extra_beds?room.extra_beds:0,
                    precioSupletoria: room.extra_beds?room.price_extra_bed:0
                }
                return roomBill;
            }) : []

        }

        APIBilling.createBill(bill).then(setBillStatus).catch(console.log);
    }

    return (
        <>
            <Navbar />
            <h1>Reserva:</h1>
            <p>Nombre: {booking?.name}</p>
            <p>Apellidos: {booking?.surname}</p>
            <p>Dni: {booking?.identifier}</p>
            <DateComponent dateProps={{label:"Check_in: ", date:booking?.check_in}}></DateComponent>
            <DateComponent dateProps={{label:"Check_out: ", date:booking?.check_out}}></DateComponent>
            <p>Habitaciones: {booking?.rooms.map(r => (<RoomComponent room={r} />))}</p>
            <Button onClick={createBill}>Generar Factura</Button>
            <Link href="/booking/[id]/check-in" as={`/booking/${booking?.booking_id}/check-in`}><Button>Check In</Button></Link>
        </>
    )
}