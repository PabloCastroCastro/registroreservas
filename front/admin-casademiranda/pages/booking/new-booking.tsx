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

    const [priceRoom, setPriceRoom] = useState(0);
    const [numExtraBed, setNumExtraBed] = useState(0);
    const [priceExtraBed, setPriceExtraBed] = useState(0);
    const [rooms, setRooms] = useState<RequestRoom[]>([]);



    function agregarHabitacion() {
        setRooms([...rooms, {           
            habitacion: selectedRoom,
            precio: priceRoom,
            supletorias: numExtraBed,
            precioSupletoria: priceExtraBed
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
                <div><h1 className='relative left-5 text-xl text-green text-opacity-75 font-semibold'>Nueva Reserva: </h1></div>
                <div id="registroReservas">
                    <form id="mi-formulario" onSubmit={handleSubmit}>
                        <div id="datos-reserva" className='grid grid-cols-2 gap-3'>
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

                            <div className="formulario-elemento">
                                <label id="dni">DNI:</label>
                                <input type="text" id="dni" name="dni"  value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
                            </div>

                            <div className="formulario-elemento">
                                <label id="email">Email:</label>
                                <input type="text" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>

                            <div className="formulario-elemento">
                                <label id="confirmationEmail">Confirmación email:</label>
                                <input type="text" id="confirmation-email" name="confirmation-email" value={confirmedEmail} onChange={(e) => setConfirmedEmail(e.target.value)} required />
                            </div>

                            <div className="formulario-elemento">
                                <label>Desea enviar email de confirmacion:
                                    <input type="checkbox" name="envioConfirmacion" id="confirmation-send-mail" onChange={e => setSendEmail(Boolean(e.target.value))} />
                                </label>
                            </div>

                            <div className="formulario-elemento">
                                <label id="fecha-checkin">Fecha de check-in:</label>
                                <input type="date" id="fecha-checkin" name="fechaCheckIn" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
                            </div>

                            <div className="formulario-elemento">
                                <label id="fecha-checkout">Fecha de check-out:</label>
                                <input type="date" id="fecha-checkout" name="fechaCheckOut" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
                            </div>
                        </div>

                        <div id="datos-habitacion">
                            <div className="formulario-elemento">
                                <label id="selectorhabitacion">Selecciona una habitación:</label>
                                <select id="selectorhabitacion" onChange={e => {setSelectedRoom(e.target.value);}} value={selectedRoom} name="habitacion">
                                    <option value="">--Selecciona una opción--</option>
                                    <option value="A Fonte">A Fonte</option>
                                    <option value="O Carpinteiro">O Carpinteiro</option>
                                    <option value="O Cuberto">O Cuberto</option>
                                    <option value="O Faiado">O Faiado</option>
                                </select>
                            </div>

                            {selectedRoom!==""&&selectedRoom!==undefined?(
                                <div>
                                    <div className="formulario-elemento" id="precio">
                                        <label id="precio">Precio</label>
                                        <input type="text" id="preciohab" name="precio" value={priceRoom} onChange={e => setPriceRoom(parseInt(e.target.value))} />
                                    </div>

                                    <div className="formulario-elemento" id="supletoria" >
                                        <label id="numerosupl">Número de supletorias:</label>
                                        <input type="number" id="numerosupl" name="numsupletoria" value={numExtraBed} onChange={e => setNumExtraBed(parseInt(e.target.value))}/>
                                        <label id="preciosupl">Precio de cada supletoria:</label>
                                        <input type="text" id="preciosupl" name="preciosupletoria" value={priceExtraBed} onChange={e => setPriceExtraBed(parseInt(e.target.value))}/>
                                        <div className="formulario-elemento" id="boton-hatitacion">
                                            <button type="button" onClick={agregarHabitacion}> Añadir habitación </button>
                                        </div>
                                    </div>
                                </div>
                            ):(
                                <div></div>
                            )}

                        </div>
                        {rooms !== undefined&&rooms.length>0?(
                            <div>
                            <label>Lista habitaciones</label>
                            <ul id="lista-habitaciones">
                                {rooms.map(room => (
                                    <RoomItemComponent room={{name: room.habitacion, extra_beds: room.supletorias}}></RoomItemComponent>
                                ))}
                            </ul>
                            </div>
                        ):(<div>Sin habitaciones añadidas</div>)}
                        <div className="formulario-elemento" id="boton-enviar">
                            <button type="submit" className="rounded-full bg-green bg-opacity-50"><p className="text-black text-opacity-75 font-semibold">Registro reserva</p></button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}