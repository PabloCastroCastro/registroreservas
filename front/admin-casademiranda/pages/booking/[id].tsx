import Navbar from '../../components/navbar/navbar'
import RoomComponent from '@/components/rooms/roomComponent';
import { useRouter } from 'next/router'
import type { Booking, ResponseError } from '../../interfaces/booking'
import type { Bill } from '@/interfaces/bill'
import type { RoomBill } from '@/interfaces/roomBill';
import * as APIBooking from "../../services/bookings";
import * as APIBilling from "../../services/bills";
import { useState, useEffect } from 'react';
import { Button } from 'flowbite-react';

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
                let roomBill: RoomBill = {
                    habitacion: room.name,
                    precio: 90,
                    supletorias: room.extra_beds?room.extra_beds:0,
                    precioSupletorias: room.extra_beds?15:0
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
            <p>Check_in: <Date>{booking?.check_in}</Date></p>
            <p>Check_out: <Date>{booking?.check_out}</Date></p>
            <p>Hablitaciones: {booking?.rooms.map(r => (<RoomComponent room={r} />))}</p>
            <Button onClick={createBill}>Generar Factura</Button>
        </>
    )
}