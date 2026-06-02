import "@/app/globals.css";
import { useState } from 'react';
import Navbar from '@/components/navbar/navbar';
import type { RequestBooking } from '@/interfaces/booking';
import type { RequestRoom } from '@/interfaces/room';
import * as APIBooking from "../../services/bookings";
import { useRouter } from 'next/router';

const inputClass = "mt-1 w-full border border-gray-light rounded-lg px-3 py-2 text-gray-dark text-sm focus:outline-none focus:border-gray";
const labelClass = "text-xs text-gray uppercase tracking-wide block";

export default function NewBooking() {

    const router = useRouter();

    const [name, setName] = useState("");
    const [surname1, setSurname1] = useState("");
    const [surname2, setSurname2] = useState("");
    const [identifier, setIdentifier] = useState("");
    const [email, setEmail] = useState("");
    const [confirmedEmail, setConfirmedEmail] = useState("");
    const [sendEmail, setSendEmail] = useState<boolean>(false);
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [paymentType, setPaymentType] = useState("OTRO");

    const [selectedRoom, setSelectedRoom] = useState("");
    const [priceRoom, setPriceRoom] = useState("");
    const [numExtraBed, setNumExtraBed] = useState("");
    const [priceExtraBed, setPriceExtraBed] = useState("");
    const [rooms, setRooms] = useState<RequestRoom[]>([]);

    function agregarHabitacion() {
        if (!selectedRoom) return;
        setRooms([...rooms, {
            habitacion: selectedRoom,
            precio: parseInt(priceRoom) || 0,
            supletorias: parseInt(numExtraBed) || 0,
            precioSupletoria: parseInt(priceExtraBed) || 0
        }]);
        setSelectedRoom("");
        setPriceRoom("");
        setNumExtraBed("");
        setPriceExtraBed("");
    }

    function eliminarHabitacion(index: number) {
        setRooms(rooms.filter((_, i) => i !== index));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (email !== confirmedEmail) {
            alert('Los correos no son iguales');
            return;
        }

        const booking: RequestBooking = {
            nombre: name,
            apellido1: surname1,
            apellido2: surname2 || null,
            dni: identifier,
            fechaCheckIn: new Date(checkIn),
            fechaCheckOut: new Date(checkOut),
            envioConfirmacion: sendEmail,
            email: email,
            habitaciones: rooms,
            estado: 'ok',
            tipo_pago: paymentType
        };

        APIBooking.createBooking(booking)
            .then(res => router.push(`/booking/${res.id}`))
            .catch(console.log);
    };

    return (
        <>
            <Navbar />
            <div className="px-4 md:px-10 mt-5">
                <h1 className="text-xl text-green text-opacity-75 font-semibold mb-5">Nueva Reserva</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                    {/* Datos del huésped */}
                    <section className="border border-gray-light rounded-lg p-4">
                        <h2 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">Datos del huésped</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Nombre</label>
                                <input className={inputClass} type="text" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div>
                                <label className={labelClass}>Primer apellido</label>
                                <input className={inputClass} type="text" value={surname1} onChange={e => setSurname1(e.target.value)} required />
                            </div>
                            <div>
                                <label className={labelClass}>Segundo apellido</label>
                                <input className={inputClass} type="text" value={surname2} onChange={e => setSurname2(e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>DNI</label>
                                <input className={inputClass} type="text" value={identifier} onChange={e => setIdentifier(e.target.value)} required />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input className={inputClass} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                            </div>
                            <div>
                                <label className={labelClass}>Confirmar email</label>
                                <input className={inputClass} type="email" value={confirmedEmail} onChange={e => setConfirmedEmail(e.target.value)} required />
                            </div>
                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-2 text-gray-dark text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4"
                                        checked={sendEmail}
                                        onChange={e => setSendEmail(e.target.checked)}
                                    />
                                    Enviar email de confirmación
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Fechas y pago */}
                    <section className="border border-gray-light rounded-lg p-4">
                        <h2 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">Fechas y pago</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Fecha check-in</label>
                                <input className={inputClass} type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required />
                            </div>
                            <div>
                                <label className={labelClass}>Fecha check-out</label>
                                <input className={inputClass} type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required />
                            </div>
                            <div>
                                <label className={labelClass}>Tipo de pago</label>
                                <select className={inputClass} value={paymentType} onChange={e => setPaymentType(e.target.value)}>
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TARJETA">Tarjeta</option>
                                    <option value="BIZUM">Bizum</option>
                                    <option value="TRANSFERENCIA">Transferencia</option>
                                    <option value="OTRO">Otro</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Habitaciones */}
                    <section className="border border-gray-light rounded-lg p-4">
                        <h2 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">Habitaciones</h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                                <label className={labelClass}>Habitación</label>
                                <select className={inputClass} value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>
                                    <option value="">-- Selecciona --</option>
                                    <option value="A Fonte">A Fonte</option>
                                    <option value="O Carpinteiro">O Carpinteiro</option>
                                    <option value="O Cuberto">O Cuberto</option>
                                    <option value="O Faiado">O Faiado</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Precio (€)</label>
                                <input className={inputClass} type="number" min="0" value={priceRoom} onChange={e => setPriceRoom(e.target.value)} disabled={!selectedRoom} />
                            </div>
                            <div>
                                <label className={labelClass}>Nº supletorias</label>
                                <input className={inputClass} type="number" min="0" value={numExtraBed} onChange={e => setNumExtraBed(e.target.value)} disabled={!selectedRoom} />
                            </div>
                            <div>
                                <label className={labelClass}>Precio supletoria (€)</label>
                                <input className={inputClass} type="number" min="0" value={priceExtraBed} onChange={e => setPriceExtraBed(e.target.value)} disabled={!selectedRoom} />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={agregarHabitacion}
                            disabled={!selectedRoom}
                            className="mt-3 inline-flex items-center gap-2 rounded-full bg-green bg-opacity-50 px-4 py-2 text-sm font-semibold text-gray-dark disabled:opacity-40"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Añadir habitación
                        </button>

                        {rooms.length > 0 ? (
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                {rooms.map((room, i) => (
                                    <div key={i} className="flex items-center justify-between border border-gray-light rounded-lg px-3 py-2">
                                        <div>
                                            <p className="text-gray-dark font-medium text-sm">{room.habitacion}</p>
                                            <p className="text-xs text-gray">{room.precio} € {room.supletorias > 0 ? `· ${room.supletorias} supletoria(s)` : ''}</p>
                                        </div>
                                        <button type="button" onClick={() => eliminarHabitacion(i)} className="text-gray hover:text-orange ml-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-xs text-gray">Sin habitaciones añadidas</p>
                        )}
                    </section>

                    <div className="flex justify-end pb-6">
                        <button type="submit" className="rounded-full bg-green bg-opacity-50 px-6 py-2 font-semibold text-gray-dark">
                            Registrar reserva
                        </button>
                    </div>

                </form>
            </div>
        </>
    );
}
