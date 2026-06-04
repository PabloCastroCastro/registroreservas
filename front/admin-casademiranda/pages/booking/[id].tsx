import "@/app/globals.css";
import Navbar from '../../components/navbar/navbar'
import RoomComponent from '@/components/rooms/roomComponent';
import { useRouter } from 'next/router'
import type { Booking, ResponseError, RequestUpdateBooking } from '../../interfaces/booking'
import type { Bill, BillExtra } from '@/interfaces/bill'
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

    // Billing modal state
    const [showBillModal, setShowBillModal] = useState(false);
    const [billName, setBillName] = useState('');
    const [billSurname, setBillSurname] = useState('');
    const [billDni, setBillDni] = useState('');
    const [billAddress, setBillAddress] = useState('');
    const [billConcepto, setBillConcepto] = useState('');
    const [billExtras, setBillExtras] = useState<BillExtra[]>([]);
    const [billLoading, setBillLoading] = useState(false);
    const [billPreviewing, setBillPreviewing] = useState(false);
    const [billSuccess, setBillSuccess] = useState(false);

    useEffect(() => {
        query.id !== undefined && typeof query.id === "string" ? APIBooking.getBookingById(query.id).then(setBooking).catch(console.log) : setBooking;
        query.id !== undefined && typeof query.id === "string" ? APIClient.getClientsByBookingId(query.id).then(setClients).catch(console.log) : setClients([]);
    }, []);

    function openBillModal() {
        if (!booking) return;
        setBillName(booking.name);
        setBillSurname(booking.surname);
        setBillDni(booking.identifier);
        setBillAddress('');
        setBillConcepto('');
        setBillExtras([]);
        setBillSuccess(false);
        setShowBillModal(true);
    }

    function addExtra() {
        setBillExtras(prev => [...prev, { descripcion: '', precio: 0 }]);
    }

    function updateExtra(index: number, field: keyof BillExtra, value: string | number) {
        setBillExtras(prev => prev.map((e, i) => i === index ? { ...e, [field]: value } : e));
    }

    function removeExtra(index: number) {
        setBillExtras(prev => prev.filter((_, i) => i !== index));
    }

    function buildBillPayload(): Bill | null {
        if (!booking) return null;
        return {
            numeroFactura: booking.confirmation_number,
            nombre: billName,
            apellidos: billSurname,
            dni: billDni,
            email: "casademirandaezaro@gmail.com",
            direccion: billAddress || undefined,
            concepto: billConcepto || undefined,
            fechaCheckIn: booking.check_in.toLocaleString(),
            fechaCheckOut: booking.check_out.toLocaleString(),
            habitaciones: booking.rooms.map(room => ({
                habitacion: room.name,
                precio: room.price,
                supletorias: room.extra_beds ?? 0,
                precioSupletoria: room.extra_beds ? room.price_extra_bed : 0
            } as RequestRoom)),
            extras: billExtras.filter(e => e.descripcion.trim() !== ''),
        };
    }

    async function handlePreviewBill() {
        const bill = buildBillPayload();
        if (!bill) return;
        setBillPreviewing(true);
        try {
            const blob = await APIBilling.previewBill(bill);
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (err) {
            console.error(err);
        } finally {
            setBillPreviewing(false);
        }
    }

    async function handleCreateBill() {
        const bill = buildBillPayload();
        if (!bill) return;
        setBillLoading(true);
        await APIBilling.createBill(bill).catch(console.error);
        setBillLoading(false);
        setBillSuccess(true);
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

    const inputClass = "rounded w-full border border-gray-light p-1 text-sm text-gray-dark";
    const labelClass = "text-xs text-gray uppercase tracking-wide block mb-1";

    return (
        <>
            <Navbar />
            <div id="titulo" className='px-4 md:px-5'>
                <h1 className='relative text-xl text-green text-opacity-75 font-semibold'>Reserva: {booking?.confirmation_number}</h1>
            </div>
            <div id="datos-reserva" className='mt-5 px-4 md:px-10 flex flex-col gap-4'>

                {/* Datos personales y fechas */}
                <section className="border border-gray-light rounded-lg p-4">
                    <h2 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">Datos de la reserva</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-gray uppercase tracking-wide">Nombre</p>
                            <p className="text-gray-dark font-medium">{booking?.name || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray uppercase tracking-wide">Apellidos</p>
                            <p className="text-gray-dark font-medium">{booking?.surname || '—'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray uppercase tracking-wide">DNI</p>
                            <p className="text-gray-dark font-medium">{booking?.identifier || '—'}</p>
                        </div>
                        <DateComponent label="Check-in" date={booking ? booking.check_in : new Date()} />
                        <DateComponent label="Check-out" date={booking ? booking.check_out : new Date()} />
                        <div>
                            <p className="text-xs text-gray uppercase tracking-wide">Tipo de pago</p>
                            <p className="text-gray-dark font-medium">{booking?.payment_type || '—'}</p>
                        </div>
                        {booking?.other_platform_reference && (
                            <div>
                                <p className="text-xs text-gray uppercase tracking-wide">Código otra plataforma</p>
                                <p className="text-gray-dark font-medium">{booking.other_platform_reference}</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Habitaciones */}
                <section className="border border-gray-light rounded-lg p-4">
                    <h2 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">Habitaciones</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {booking?.rooms.map(r => <RoomComponent key={r.name} room={r} />)}
                    </div>
                </section>

                {/* Huéspedes */}
                <section className="border border-gray-light rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xs text-gray uppercase tracking-wide font-semibold">Huéspedes</h2>
                        <Link className='inline-flex items-center gap-1 rounded-full bg-green bg-opacity-50 text-gray-dark text-opacity-75 px-3 py-1 text-xs font-semibold' href={"/client/new-client?booking_id=" + booking?.booking_id}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            Añadir
                        </Link>
                    </div>
                    {clients && booking ? clients.map(client => (
                        <ClientComponent key={client.client_id} client={{ ...client, booking_id: booking.booking_id }} />
                    )) : <p className="text-xs text-gray">Sin huéspedes registrados</p>}
                </section>

            </div>
            <div id="botones" className='mt-5 px-4 md:px-5 flex flex-wrap gap-3'>
                <Button className='rounded-full bg-green bg-opacity-50 text-gray-dark text-opacity-75' onClick={registerCheckIn}>Registrar CheckIn</Button>
                <Button className='rounded-full bg-green bg-opacity-50 text-gray-dark text-opacity-75' onClick={openBillModal}>Generar Factura</Button>
                <Button className='rounded-full bg-blue bg-opacity-50 text-gray-dark text-opacity-75' onClick={openEditModal}>Editar Reserva</Button>
                <Button className='rounded-full bg-yellow bg-opacity-50 text-gray-dark text-opacity-75' onClick={() => setShowConfirmModal('cancel')}>Cancelar Reserva</Button>
                <Button className='rounded-full bg-orange bg-opacity-50 text-gray-dark text-opacity-75' onClick={() => setShowConfirmModal('delete')}>Eliminar Reserva</Button>
            </div>

            {/* Modal de facturación */}
            {showBillModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 overflow-y-auto py-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg mx-4">
                        <h2 className="text-xl font-semibold mb-4 text-gray-dark">Generar Factura</h2>

                        {billSuccess ? (
                            <div className="text-center py-6">
                                <p className="text-green font-semibold text-lg mb-4">Factura generada correctamente</p>
                                <Button className='bg-gray-light text-gray-dark text-opacity-75' onClick={() => setShowBillModal(false)}>Cerrar</Button>
                            </div>
                        ) : (
                            <>
                                <section className="mb-4">
                                    <h3 className="text-xs text-gray uppercase tracking-wide font-semibold mb-3">Datos de facturación</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className={labelClass}>Nombre</label>
                                            <input className={inputClass} value={billName} onChange={e => setBillName(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Apellidos</label>
                                            <input className={inputClass} value={billSurname} onChange={e => setBillSurname(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>DNI / NIF</label>
                                            <input className={inputClass} value={billDni} onChange={e => setBillDni(e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Dirección (opcional)</label>
                                            <input className={inputClass} value={billAddress} onChange={e => setBillAddress(e.target.value)} placeholder="Calle, número, ciudad..." />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <label className={labelClass}>Concepto (opcional)</label>
                                            <input className={inputClass} value={billConcepto} onChange={e => setBillConcepto(e.target.value)} placeholder="Ej: Alojamiento vacacional en Casa de Miranda" />
                                        </div>
                                    </div>
                                </section>

                                <section className="mb-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="text-xs text-gray uppercase tracking-wide font-semibold">Extras</h3>
                                        <button
                                            onClick={addExtra}
                                            className="text-xs rounded-full bg-gray-light px-3 py-1 text-gray-dark font-semibold"
                                        >
                                            + Añadir extra
                                        </button>
                                    </div>
                                    {billExtras.length === 0 ? (
                                        <p className="text-xs text-gray">Sin extras</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {billExtras.map((extra, i) => (
                                                <div key={i} className="flex gap-2 items-center">
                                                    <input
                                                        className="flex-1 rounded border border-gray-light p-1 text-sm text-gray-dark"
                                                        placeholder="Descripción"
                                                        value={extra.descripcion}
                                                        onChange={e => updateExtra(i, 'descripcion', e.target.value)}
                                                    />
                                                    <input
                                                        className="w-24 rounded border border-gray-light p-1 text-sm text-gray-dark text-right"
                                                        placeholder="Precio €"
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={extra.precio}
                                                        onChange={e => updateExtra(i, 'precio', parseFloat(e.target.value) || 0)}
                                                    />
                                                    <button
                                                        onClick={() => removeExtra(i)}
                                                        className="text-orange text-xs font-semibold px-2"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>

                                <div className="flex justify-end gap-3 mt-5 flex-wrap">
                                    <Button className='bg-gray-light text-gray-dark text-opacity-75' onClick={() => setShowBillModal(false)}>Cancelar</Button>
                                    <Button
                                        className='bg-gray-light text-gray-dark text-opacity-75'
                                        onClick={handlePreviewBill}
                                        disabled={billPreviewing || billLoading}
                                    >
                                        {billPreviewing ? 'Cargando...' : 'Vista previa'}
                                    </Button>
                                    <Button
                                        className='bg-green bg-opacity-50 text-gray-dark text-opacity-75'
                                        onClick={handleCreateBill}
                                        disabled={billLoading || billPreviewing}
                                    >
                                        {billLoading ? 'Generando...' : 'Confirmar y enviar'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

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
