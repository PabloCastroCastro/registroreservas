import "@/app/globals.css";
import Navbar from '../../components/navbar/navbar'
import RoomComponent from '@/components/rooms/roomComponent';
import { useRouter } from 'next/router'
import type { Booking, ResponseError, RequestUpdateBooking } from '../../interfaces/booking'
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
    const router = useRouter()
    const { query } = router
    const [booking, setBooking] = useState<Booking>();
    const [clients, setClients] = useState<Client[]>();
    const [billStatus, setBillStatus] = useState(200);
    const [checkInStatus, setCheckInStatus] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState<'cancel' | 'delete' | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [editSurname, setEditSurname] = useState('');
    const [editIdentifier, setEditIdentifier] = useState('');
    const [editCheckIn, setEditCheckIn] = useState('');
    const [editCheckOut, setEditCheckOut] = useState('');
    const [editPaymentType, setEditPaymentType] = useState('');
    const [editPlatformRef, setEditPlatformRef] = useState('');

    useEffect(() => {
        query.id !== undefined && typeof query.id === "string" ? APIBooking.getBookingById(query.id).then(setBooking).catch(console.log) : setBooking;
        query.id !== undefined && typeof query.id === "string" ? APIClient.getClientsByBookingId(query.id).then(setClients).catch(console.log) : setClients([]);
    }, []);

    function createBill() {

        let bill: Bill = {
            numeroFactura: booking? booking.confirmation_number: "",
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

    function registerCheckIn() {
        if (query.id !== undefined && typeof query.id === "string") {
            APIBooking.postRegisterCheckIn(query.id).then(
                res => {
                    console.log('Response status:', res.status);
                    setCheckInStatus(res.status);
                    setShowSuccessModal(true);
                }
            ).catch(console.log)

        } else {
            setCheckInStatus(0);
            setShowSuccessModal(false);
        }
    }


    function openEditModal() {
        if (!booking) return;
        setEditName(booking.name);
        setEditSurname(booking.surname);
        setEditIdentifier(booking.identifier);
        setEditCheckIn(new Date(booking.check_in).toISOString().split('T')[0]);
        setEditCheckOut(new Date(booking.check_out).toISOString().split('T')[0]);
        setEditPaymentType(booking.payment_type ?? 'OTRO');
        setEditPlatformRef(booking.other_platform_reference ?? '');
        setShowEditModal(true);
    }

    async function handleUpdate() {
        if (!query.id || typeof query.id !== 'string') return;
        const update: RequestUpdateBooking = {
            nombre: editName,
            apellidos: editSurname,
            dni: editIdentifier,
            checkInDate: editCheckIn,
            checkOutDate: editCheckOut,
            tipo_pago: editPaymentType,
            referenciaOtraPlataforma: editPlatformRef
        };
        const status = await APIBooking.updateBooking(query.id, update);
        if (status === 200) {
            const updated = await APIBooking.getBookingById(query.id);
            setBooking(updated);
        }
        setShowEditModal(false);
    }

    async function handleCancel() {
        if (query.id && typeof query.id === "string") {
            await APIBooking.cancelBooking(query.id);
            router.push('/');
        }
    }

    async function handleDelete() {
        if (query.id && typeof query.id === "string") {
            await APIBooking.deleteBooking(query.id);
            router.push('/');
        }
    }

    return (
        <>
            <Navbar />
            <div id="titulo" className='px-4 md:px-5'>
                <h1 className='relative text-xl text-green text-opacity-75 font-semibold'>Reserva: {booking?.confirmation_number}</h1>
            </div>
            <div id="datos-reserva" className='mt-5 px-4 md:px-10 grid grid-cols-1 gap-2'>
                <div id="datos-comunes" className='grid grid-cols-1 md:grid-cols-3 gap-3'>
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
                        <DateComponent label="Fecha check_in: " date={booking ? booking.check_in : new Date()} />
                    </div>
                    <div className="grid grid-cols-1">
                        <DateComponent label="Fecha check_out: " date={booking ? booking.check_out : new Date()} />
                    </div>
                    <div className="grid grid-cols-1"></div>
                </div>
                <div id="datos-habitaciones" className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                    <div className="grid grid-cols-1">
                        <label className='text-gray-dark text-opacity-75' id="habitaciones">Habitaciones:</label>
                    </div>
                    <div className="grid grid-cols-1"></div>
                    <div className="grid grid-cols-1"></div>
                    {booking?.rooms.map(r => (<div className="grid grid-cols-1" key={r.name}><RoomComponent room={r} /></div>))}
                </div>
                <div id="datos-clientes" className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                    <div className="grid grid-cols-1">
                        <label className='text-gray-dark text-opacity-75' id="clientes">Huespedes:</label>
                    </div>
                    <div className="grid grid-cols-1"></div>
                    <div className="grid grid-cols-1"></div>
                    {clients && booking ? clients.map(client => (<div key={client.client_id}>
                        <ClientComponent client={{ ...client, booking_id: booking.booking_id }}></ClientComponent>
                    </div>)) : <></>}
                    <div className="grid grid-cols-1">
                        <Link className='w-12 h-12 rounded-full bg-green bg-opacity-50 hover:bg-gray-dark text-center text-gray-dark text-opacity-75' href={"/client/new-client?booking_id=" + booking?.booking_id}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
            <div id="botones" className='mt-5 px-4 md:px-5 flex flex-wrap gap-3'>
                <Button className='rounded-full bg-green bg-opacity-50 text-gray-dark text-opacity-75' onClick={registerCheckIn}>Registrar CheckIn</Button>
                <Button className='rounded-full bg-green bg-opacity-50 text-gray-dark text-opacity-75' onClick={createBill}>Generar Factura</Button>
                <Button className='rounded-full bg-blue bg-opacity-50 text-gray-dark text-opacity-75' onClick={openEditModal}>Editar Reserva</Button>
                <Button className='rounded-full bg-yellow bg-opacity-50 text-gray-dark text-opacity-75' onClick={() => setShowConfirmModal('cancel')}>Cancelar Reserva</Button>
                <Button className='rounded-full bg-orange bg-opacity-50 text-gray-dark text-opacity-75' onClick={() => setShowConfirmModal('delete')}>Eliminar Reserva</Button>
            </div>
            {/* Modal de edición */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg">
                        <h2 className="text-xl font-semibold mb-4 text-gray-dark">Editar Reserva</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-gray-dark text-sm">Nombre</label>
                                <input className="rounded w-full border border-gray-light p-1 text-sm" value={editName} onChange={e => setEditName(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-gray-dark text-sm">Apellidos</label>
                                <input className="rounded w-full border border-gray-light p-1 text-sm" value={editSurname} onChange={e => setEditSurname(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-gray-dark text-sm">DNI</label>
                                <input className="rounded w-full border border-gray-light p-1 text-sm" value={editIdentifier} onChange={e => setEditIdentifier(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-gray-dark text-sm">Tipo de pago</label>
                                <select className="rounded w-full border border-gray-light p-1 text-sm" value={editPaymentType} onChange={e => setEditPaymentType(e.target.value)}>
                                    <option value="EFECTIVO">Efectivo</option>
                                    <option value="TARJETA">Tarjeta</option>
                                    <option value="BIZUM">Bizum</option>
                                    <option value="TRANSFERENCIA">Transferencia</option>
                                    <option value="OTRO">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-gray-dark text-sm">Fecha check-in</label>
                                <input className="rounded w-full border border-gray-light p-1 text-sm" type="date" value={editCheckIn} onChange={e => setEditCheckIn(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-gray-dark text-sm">Fecha check-out</label>
                                <input className="rounded w-full border border-gray-light p-1 text-sm" type="date" value={editCheckOut} onChange={e => setEditCheckOut(e.target.value)} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-gray-dark text-sm">Código otra plataforma</label>
                                <input className="rounded w-full border border-gray-light p-1 text-sm" value={editPlatformRef} onChange={e => setEditPlatformRef(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-5">
                            <Button className='bg-gray-light text-gray-dark text-opacity-75' onClick={() => setShowEditModal(false)}>Cancelar</Button>
                            <Button className='bg-green bg-opacity-50 text-gray-dark text-opacity-75' onClick={handleUpdate}>Guardar</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de éxito */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                        {checkInStatus === 204 ? (
                            <>
                                <h2 className="text-xl font-semibold mb-4 text-green">Check-In realizado correctamente</h2>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold mb-4 text-orange">Error en el Check-In</h2>
                            </>
                        )}
                        <Button onClick={() => setShowSuccessModal(false)}>Cerrar</Button>
                    </div>
                </div>
            )}

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                        {showConfirmModal === 'cancel' ? (
                            <h2 className="text-xl font-semibold mb-4">¿Cancelar la reserva {booking?.confirmation_number}?</h2>
                        ) : (
                            <h2 className="text-xl font-semibold mb-4">¿Eliminar la reserva {booking?.confirmation_number}? Esta acción no se puede deshacer.</h2>
                        )}
                        <div className="flex justify-center gap-4">
                            <Button className='bg-gray bg-opacity-50 text-gray-dark text-opacity-75' onClick={() => setShowConfirmModal(null)}>Volver</Button>
                            <Button className={`bg-opacity-50 text-gray-dark text-opacity-75 ${showConfirmModal === 'cancel' ? 'bg-yellow' : 'bg-orange'}`}
                                onClick={() => { setShowConfirmModal(null); showConfirmModal === 'cancel' ? handleCancel() : handleDelete(); }}>
                                {showConfirmModal === 'cancel' ? 'Cancelar reserva' : 'Eliminar reserva'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}