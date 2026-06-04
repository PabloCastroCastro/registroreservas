import "@/app/globals.css";
import { useState } from 'react';
import Navbar from '@/components/navbar/navbar';
import type { RequestBooking } from '@/interfaces/booking';
import type { RequestRoom } from '@/interfaces/room';
import * as APIBooking from "../../services/bookings";
import * as APIRoomPrices from "../../services/roomPrices";
import { getRoomsAvailability } from "../../services/bookings";

const ALL_ROOMS = ['A Fonte', 'O Carpinteiro', 'O Cuberto', 'O Faiado'];
import { useRouter } from 'next/router';

const inputClass = "mt-1 w-full border border-gray-light rounded-lg px-3 py-2 text-gray-dark text-sm focus:outline-none focus:border-gray";
const inputErrorClass = "mt-1 w-full border border-orange rounded-lg px-3 py-2 text-gray-dark text-sm focus:outline-none focus:border-orange";
const labelClass = "text-xs text-gray uppercase tracking-wide block";
const errorClass = "text-xs text-orange mt-1";

type Errors = Record<string, string>;

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
    const [availability, setAvailability] = useState<Record<string, boolean>>({});

    const [errors, setErrors] = useState<Errors>({});
    const [submitting, setSubmitting] = useState(false);

    function setError(field: string, msg: string) {
        setErrors(prev => ({ ...prev, [field]: msg }));
    }
    function clearError(field: string) {
        setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
    }

    async function fetchAvailability(ci: string, co: string) {
        if (!ci || !co) return;
        const map = await getRoomsAvailability(ci, co);
        setAvailability(map);
    }

    async function handleRoomChange(room: string) {
        setSelectedRoom(room);
        if (!room || !checkIn) return;
        const priceResult = await APIRoomPrices.getPriceForRoom(room, checkIn);
        if (priceResult) {
            setPriceRoom(String(priceResult.price));
            if (parseInt(numExtraBed) > 0 && priceResult.priceExtraBed) {
                setPriceExtraBed(String(priceResult.priceExtraBed));
            }
        }
    }

    function agregarHabitacion() {
        if (!selectedRoom) return;
        const price = parseFloat(priceRoom);
        if (!priceRoom || price <= 0) {
            setError('roomPrice', 'El precio debe ser mayor que 0');
            return;
        }
        const extraBeds = parseInt(numExtraBed) || 0;
        if (extraBeds > 0 && (!priceExtraBed || parseFloat(priceExtraBed) <= 0)) {
            setError('roomPrice', 'Indica el precio de la cama supletoria');
            return;
        }
        clearError('roomPrice');
        clearError('rooms');
        setRooms([...rooms, {
            habitacion: selectedRoom,
            precio: price,
            supletorias: extraBeds,
            precioSupletoria: parseFloat(priceExtraBed) || 0
        }]);
        setSelectedRoom("");
        setPriceRoom("");
        setNumExtraBed("");
        setPriceExtraBed("");
    }

    function eliminarHabitacion(index: number) {
        setRooms(rooms.filter((_, i) => i !== index));
    }

    function validate(): boolean {
        const e: Errors = {};

        if (!name.trim()) e.name = 'El nombre es obligatorio';
        if (!surname1.trim()) e.surname1 = 'El primer apellido es obligatorio';
        if (!identifier.trim()) e.identifier = 'El DNI es obligatorio';

        if (!email.trim()) {
            e.email = 'El email es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            e.email = 'Formato de email no válido';
        } else if (email !== confirmedEmail) {
            e.confirmedEmail = 'Los emails no coinciden';
        }

        if (!checkIn) {
            e.checkIn = 'La fecha de check-in es obligatoria';
        }
        if (!checkOut) {
            e.checkOut = 'La fecha de check-out es obligatoria';
        }
        if (checkIn && checkOut) {
            if (new Date(checkOut) <= new Date(checkIn)) {
                e.checkOut = 'El check-out debe ser posterior al check-in';
            }
        }

        if (rooms.length === 0) e.rooms = 'Añade al menos una habitación';

        setErrors(e);
        return Object.keys(e).length === 0;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);
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
            .catch(err => { console.error(err); setSubmitting(false); });
    };

    const f = (field: string) => errors[field] ? inputErrorClass : inputClass;

    return (
        <>
            <Navbar />
            <div className="px-4 md:px-10 mt-5">
                <h1 className="text-xl text-green text-opacity-75 font-semibold mb-5">Nueva Reserva</h1>

                <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

                    {/* Datos del huésped */}
                    <section className="border border-gray-light rounded-lg p-4">
                        <h2 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">Datos del huésped</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Nombre *</label>
                                <input className={f('name')} type="text" value={name}
                                    onChange={e => { setName(e.target.value); clearError('name'); }} />
                                {errors.name && <p className={errorClass}>{errors.name}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Primer apellido *</label>
                                <input className={f('surname1')} type="text" value={surname1}
                                    onChange={e => { setSurname1(e.target.value); clearError('surname1'); }} />
                                {errors.surname1 && <p className={errorClass}>{errors.surname1}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Segundo apellido</label>
                                <input className={inputClass} type="text" value={surname2}
                                    onChange={e => setSurname2(e.target.value)} />
                            </div>
                            <div>
                                <label className={labelClass}>DNI *</label>
                                <input className={f('identifier')} type="text" value={identifier}
                                    onChange={e => { setIdentifier(e.target.value); clearError('identifier'); }} />
                                {errors.identifier && <p className={errorClass}>{errors.identifier}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Email *</label>
                                <input className={f('email')} type="email" value={email}
                                    onChange={e => { setEmail(e.target.value); clearError('email'); clearError('confirmedEmail'); }} />
                                {errors.email && <p className={errorClass}>{errors.email}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Confirmar email *</label>
                                <input className={f('confirmedEmail')} type="email" value={confirmedEmail}
                                    onChange={e => { setConfirmedEmail(e.target.value); clearError('confirmedEmail'); }} />
                                {errors.confirmedEmail && <p className={errorClass}>{errors.confirmedEmail}</p>}
                            </div>
                            <div className="flex items-end pb-2">
                                <label className="flex items-center gap-2 text-gray-dark text-sm cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4" checked={sendEmail}
                                        onChange={e => setSendEmail(e.target.checked)} />
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
                                <label className={labelClass}>Fecha check-in *</label>
                                <input className={f('checkIn')} type="date" value={checkIn}
                                    onChange={e => { setCheckIn(e.target.value); clearError('checkIn'); clearError('checkOut'); if (checkOut) fetchAvailability(e.target.value, checkOut); }} />
                                {errors.checkIn && <p className={errorClass}>{errors.checkIn}</p>}
                            </div>
                            <div>
                                <label className={labelClass}>Fecha check-out *</label>
                                <input className={f('checkOut')} type="date" value={checkOut}
                                    onChange={e => { setCheckOut(e.target.value); clearError('checkOut'); if (checkIn) fetchAvailability(checkIn, e.target.value); }} />
                                {errors.checkOut && <p className={errorClass}>{errors.checkOut}</p>}
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
                                <select className={inputClass} value={selectedRoom} onChange={e => handleRoomChange(e.target.value)}>
                                    <option value="">-- Selecciona --</option>
                                    {ALL_ROOMS.map(r => (
                                        <option key={r} value={r} disabled={availability[r] === false}>
                                            {r}{availability[r] === false ? ' (no disponible)' : availability[r] === true ? ' ✓' : ''}
                                        </option>
                                    ))}
                                </select>
                                {checkIn && checkOut && Object.keys(availability).length > 0 && (
                                    <p className="text-xs text-gray mt-1">
                                        {ALL_ROOMS.filter(r => availability[r] === true).length} habitación(es) disponible(s)
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className={labelClass}>Precio (€) *</label>
                                <input className={errors.roomPrice ? inputErrorClass : inputClass}
                                    type="number" min="0" step="0.01" value={priceRoom}
                                    onChange={e => { setPriceRoom(e.target.value); clearError('roomPrice'); }}
                                    disabled={!selectedRoom} />
                            </div>
                            <div>
                                <label className={labelClass}>Nº supletorias</label>
                                <input className={inputClass} type="number" min="0" value={numExtraBed}
                                    onChange={async e => {
                                        setNumExtraBed(e.target.value);
                                        const n = parseInt(e.target.value) || 0;
                                        if (n > 0 && selectedRoom && checkIn) {
                                            const result = await APIRoomPrices.getPriceForRoom(selectedRoom, checkIn);
                                            if (result?.priceExtraBed) setPriceExtraBed(String(result.priceExtraBed));
                                        } else if (n === 0) {
                                            setPriceExtraBed('');
                                        }
                                    }} disabled={!selectedRoom} />
                            </div>
                            <div>
                                <label className={labelClass}>Precio supletoria (€)</label>
                                <input className={inputClass} type="number" min="0" step="0.01" value={priceExtraBed}
                                    onChange={e => setPriceExtraBed(e.target.value)} disabled={!selectedRoom} />
                            </div>
                        </div>

                        {errors.roomPrice && <p className={errorClass + " mt-1"}>{errors.roomPrice}</p>}

                        <button type="button" onClick={agregarHabitacion}
                            disabled={!selectedRoom || availability[selectedRoom] === false}
                            className="mt-3 inline-flex items-center gap-2 rounded-full bg-green bg-opacity-50 px-4 py-2 text-sm font-semibold text-gray-dark disabled:opacity-40">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Añadir habitación
                        </button>

                        {errors.rooms && <p className={errorClass + " mt-2"}>{errors.rooms}</p>}

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
                        <button type="submit" disabled={submitting}
                            className="rounded-full bg-green bg-opacity-50 px-6 py-2 font-semibold text-gray-dark disabled:opacity-40">
                            {submitting ? 'Registrando...' : 'Registrar reserva'}
                        </button>
                    </div>

                </form>
            </div>
        </>
    );
}
