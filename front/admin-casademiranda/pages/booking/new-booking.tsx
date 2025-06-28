import "@/app/globals.css";
import { useState, useEffect } from 'react';
import  Navbar from '@/components/navbar/navbar';
import type { RequestBooking } from '@/interfaces/booking';
import type { RequestRoom, Room } from '@/interfaces/room';
import RoomItemComponent from '@/components/rooms/roomItemComponent';
import * as APIBooking from "../../services/bookings";
import { useRouter } from 'next/router';

export default function NewBooking() {

    const router = useRouter()

    const [selectedRoom, setSelectedRoom] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [identifier, setIdentifier] = useState("");
    const [email, setEmail] = useState("");
    const [confirmedEmail, setConfirmedEmail] = useState("");
    const [sendEmail, setSendEmail] = useState<boolean>(false);
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");

    const [priceRoom, setPriceRoom] = useState("");
    const [numExtraBed, setNumExtraBed] = useState("");
    const [priceExtraBed, setPriceExtraBed] = useState("");
    const [rooms, setRooms] = useState<RequestRoom[]>([]);



    function agregarHabitacion() {
        setRooms([...rooms, {           
            habitacion: selectedRoom,
            precio: parseInt(priceRoom),
            supletorias: parseInt(numExtraBed),
            precioSupletoria: parseInt(priceExtraBed)
        }]);

    }

    const handleSubmit = () => {

        if(email !== confirmedEmail){
            alert('Los correos no son iguales')
            return new Error('Mails are distincts')
        }

        let booking: RequestBooking = {
            nombre: name,
            apellidos: surname,
            dni: identifier,
            fechaCheckIn: new Date(checkIn),
            fechaCheckOut: new Date(checkOut),
            envioConfirmacion: sendEmail,
            email: email,
            habitaciones: rooms
        };

        console.log(JSON.stringify(booking));
        //Check response, if is 200 ok router if is not print the error
        APIBooking.createBooking(booking).then(res => router.push("/")).catch(console.log);

    }
    

    return (
        <>
            <Navbar></Navbar>
            <div>
                <div className="grid grid-cols-1">
                    <h1 className='relative left-5 text-xl text-green text-opacity-75 font-semibold'>Nueva Reserva</h1>
                </div>
                <div className="mt-10 ml-10" id="registroReservas">
                    <form id="mi-formulario" onSubmit={handleSubmit}>
                        <div id="datos-reserva" className='grid grid-cols-3 gap-3'>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="nombre">Nombre </label>
                                <div className='flex flex-row'>
                                    <input className='rounded-full' type="text" id="nombre" name="nombre" value={name} onChange={(e) => setName(e.target.value)} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="apellidos">Apellidos </label>
                                <div className='flex flex-row'>
                                    <input className='rounded-full' type="text" id="apellidos" name="apellidos" value={surname} onChange={(e) => setSurname(e.target.value)} required  />
                                </div>
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="dni">DNI</label>
                                <div className="flex flex-row">
                                    <input className='rounded-full' type="text" id="dni" name="dni"  value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="email">Email</label>
                                <div className="flex flex-row">
                                    <input className='rounded-full' type="text" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="confirmationEmail">Confirmación email</label>
                                <input className='rounded-full' type="text" id="confirmation-email" name="confirmation-email" value={confirmedEmail} onChange={(e) => setConfirmedEmail(e.target.value)} required />
                            </div>

                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75'>Desea enviar email de confirmacion
                                    <input type="checkbox" name="envioConfirmacion" id="confirmation-send-mail" onChange={e => setSendEmail(Boolean(e.target.value))} />
                                </label>
                            </div>

                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="fecha-checkin">Fecha de check-in</label>
                                <input className='rounded-full text-gray-dark text-opacity-75' type="date" id="fecha-checkin" name="fechaCheckIn" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
                            </div>

                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="fecha-checkout">Fecha de check-out</label>
                                <input className='rounded-full text-gray-dark text-opacity-75' type="date" id="fecha-checkout" name="fechaCheckOut" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
                            </div>
                        </div>

                        <div className="mt-3 grid grid-cols-3" id="datos-habitacion">
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="selectorhabitacion">Selecciona una habitación</label>
                                <select className='rounded-full text-gray-dark text-opacity-75' id="selectorhabitacion" onChange={e => {setSelectedRoom(e.target.value);}} value={selectedRoom} name="habitacion">
                                    <option  value="">--Selecciona una opción--</option>
                                    <option value="A Fonte">A Fonte</option>
                                    <option value="O Carpinteiro">O Carpinteiro</option>
                                    <option value="O Cuberto">O Cuberto</option>
                                    <option value="O Faiado">O Faiado</option>
                                </select>
                            </div>
                        </div>
                            {selectedRoom!==""&&selectedRoom!==undefined?(
                                <div className="mt-3 grid grid-cols-3 gap-3">
                                    <div className="grid grid-cols-1" id="precio">
                                        <label className='text-gray-dark text-opacity-75' id="precio">Precio</label>
                                        <input className='rounded-full text-gray-dark text-opacity-75' type="number" id="preciohab" name="precio" value={priceRoom} onChange={e => setPriceRoom(e.target.value)} />
                                    </div>
                                    <div className="grid grid-cols-1" id="supletoria" >
                                        <label className='text-gray-dark text-opacity-75' id="numerosupl">Número de supletorias</label>
                                        <input className='rounded-full text-gray-dark text-opacity-75' type="number" id="numerosupl" name="numsupletoria" value={numExtraBed} onChange={e => setNumExtraBed(e.target.value)}/>
                                    </div>
                                    <div className="grid grid-cols-1" id="supletoria" >
                                        <label className='text-gray-dark text-opacity-75' id="preciosupl">Precio de cada supletoria</label>
                                        <input className='rounded-full text-gray-dark text-opacity-75' type="number" id="preciosupl" name="preciosupletoria" value={priceExtraBed} onChange={e => setPriceExtraBed(e.target.value)}/>
                                    </div>
                                    <div className="grid grid-cols-1" id="boton-hatitacion">
                                        <button className="w-12 h-12 rounded-full bg-green bg-opacity-50" type="button" onClick={agregarHabitacion}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ):(
                                <div></div>
                            )}
                        {rooms !== undefined&&rooms.length>0?(
                            <div className="mt-3">
                            <label className='text-gray-dark text-opacity-75'>Lista habitaciones</label>
                            <ul id="lista-habitaciones">
                                {rooms.map(room => (
                                    <div key={room.habitacion}>
                                        <RoomItemComponent room={{name: room.habitacion, price: room.precio, extra_beds: room.supletorias, price_extra_bed: room.precioSupletoria}}></RoomItemComponent>
                                    </div>
                                ))}
                            </ul>
                            </div>
                        ):(<div className="mt-3"><label className='text-gray-dark text-opacity-75'>Sin habitaciones añadidas</label></div>)}
                        <div className="mt-10 grid grid-cols-9" id="boton-enviar">
                            <button type="submit" className="rounded-full bg-green bg-opacity-50"><p className="text-black text-opacity-75 font-semibold">Registro reserva</p></button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}