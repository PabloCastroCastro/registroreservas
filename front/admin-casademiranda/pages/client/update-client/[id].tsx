'use client';

import "@/app/globals.css";
import Navbar from "@/components/navbar/navbar";
import { Client } from "@/interfaces/client"
import * as APIClient from '@/services/clients';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Country = {
    pais: string;
    codigo: string; // ISO 3166-1 alpha-3, como "ESP", "USA", etc.
};

type Location = {
    codigo: string;
    municipio: string;
};

export default function UpdateClient() {


    const { query } = useRouter();
    const router = useRouter();

    const [client, setClient] = useState<Client>();
    const [clientStatus, setClientStatus] = useState(200);
    const [bookingId, setBookingId] = useState(query !== undefined && query.booking_id !== undefined && typeof (query.booking_id) === "string" ? query.booking_id : "");
    const [clientId, setClientId] = useState(query !== undefined && query.id !== undefined && typeof (query.id) === "string" ? query.id : "");
    const [municipios, setMunicipios] = useState<Location[]>([]);
    const [municipioSelectedCodigo, setMunicipioSelectedCodigo] = useState("");
    const [paises, setPaises] = useState<Country[]>([]);
    const [countryCodeSelected, setCountryCodeSelected] = useState("");
    const [younger, setYounger] = useState(false);



    useEffect(() => {
        APIClient.getClientById(clientId).then(setClient).catch(console.log);
        fetch("/municipios.json")
            .then((res) => res.json())
            .then((data) => setMunicipios(data))
            .catch((err) => console.error(err));
        fetch("/paises-alpha3.json")
            .then((res) => res.json())
            .then((data) => setPaises(data))
            .catch((error) => console.error("Error cargando países:", error));
    }, []);

    const validData = (client: Client | undefined) => {
        if (client === undefined) {
            return false;
        }
        return true;
    }


    const isYounger = (fecha: string | Date | null | undefined): boolean => {
        if (!fecha) return false;

        const parsedFecha = fecha instanceof Date ? fecha : new Date(fecha);
        if (isNaN(parsedFecha.getTime())) return false; // Fecha inválida

        const hoy = new Date();
        const edad = hoy.getFullYear() - parsedFecha.getFullYear();
        const cumpleEsteAño =
            hoy.getMonth() > parsedFecha.getMonth() ||
            (hoy.getMonth() === parsedFecha.getMonth() && hoy.getDate() >= parsedFecha.getDate());

        return edad < 18 || (edad === 17 && !cumpleEsteAño);
    };

    const handleSubmit = () => {

        if (!validData(client)) {

            alert('Los datos del cliente no son validos')
            return new Error('Invalid client data')
        }

        client ? APIClient.updateClient({ ...client, booking_id: bookingId }).then(res => router.push("/booking/" + res?.booking_id + "/check-in")).catch(console.log) : console.log('Invalid client', JSON.stringify(client));


    }

    return (
        <>
            <Navbar></Navbar>
            <div id="titulo" className='ml-5'>
                <h1 className='relative text-xl text-green text-opacity-75 font-semibold'>Actualizar Cliente: </h1>
            </div>
            {client ? (
                <div id="datos-cliente" className='mt-5 ml-10 grid grid-cols-1 gap-2'>
                    <form id="mi-formulario" onSubmit={handleSubmit}>
                        <div className='grid grid-cols-3 gap-3'>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="fecha-checkin">Fecha de check-in:</label>
                                <input type="date" className='rounded-full' id="fecha-checkin" name="fechaCheckIn" value={client.check_in ? new Date(client.check_in).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]} onChange={(e) => setClient({ ...client, check_in: new Date(e.target.value) })} required />
                            </div>

                            <div className="grid grid-cols-1">
                                <label className='rounded-full text-gray-dark text-opacity-75' id="nacionality">Nacionalidad:</label>
                                <select
                                    className="rounded-full"
                                    id="selector-nacionality"
                                    value={client.nacionality || ''}
                                    onChange={(e) => setClient({ ...client, nacionality: e.target.value })}
                                >
                                    <option value="">-- Elige un país --</option>
                                    {paises.map(p => (
                                        <option key={p.codigo} value={p.codigo}>{p.pais}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="documentType">Tipo documento:</label>
                                <select className='rounded-full' name="documentType" id="documentType" onChange={e => setClient({ ...client, document_type: e.target.value })} value={client.document_type} required>
                                    <option value="NIF">NIF - Número de Identificación Fiscal</option>
                                    <option value="NIE">NIE - Número de Identidad de Extranjero</option>
                                    <option value="PAS">PAS - Número de pasaporte</option>
                                    <option value="OTRO">Otro</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="documentNumber">Número documento:</label>
                                <input className='rounded-full' type="text" id="documentNumber" name="documentNumber" value={client.document_number} onChange={(e) => setClient({ ...client, document_number: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="supportDocument">Soporte documento:</label>
                                <input className='rounded-full' type="text" id="supportDocument" name="supportDocument" value={client.support_document} onChange={(e) => setClient({ ...client, support_document: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="expeditionDate">Fecha de expedición:</label>
                                <input className='rounded-full' type="date" id="expeditionDate" name="expeditionDate" value={client.expedition_date ? new Date(client.expedition_date).toISOString().split('T')[0] : ""} onChange={(e) => setClient({ ...client, expedition_date: new Date(e.target.value) })} required />
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="nombre">Nombre:</label>
                                <input className='rounded-full' type="text" id="nombre" name="nombre" value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="firstSurname">Primer apellido:</label>
                                <input className='rounded-full' type="text" id="firstSurname" name="firstSurname" value={client.firstSurname} onChange={(e) => setClient({ ...client, firstSurname: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="secondSurname">Segundo apellido:</label>
                                <input className='rounded-full' type="text" id="secondSurname" name="secondSurname" value={client.secondSurname} onChange={(e) => setClient({ ...client, secondSurname: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="gender">Genero:</label>
                                <select className='rounded-full' id="selectorGender" onChange={(e) => setClient({ ...client, gender: e.target.value })} value={client.gender} name="gender">
                                    <option value="">--Selecciona una opción--</option>
                                    <option value="M">Masculino</option>
                                    <option value="F">Femenino</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="birthdate">Fecha de nacimiento:</label>
                                <input className='rounded-full' type="date" id="birthdate" name="birthdate" value={client.birthdate ? new Date(client.birthdate).toISOString().split('T')[0] : ""} onChange={(e) => setClient({ ...client, birthdate: new Date(e.target.value) })} required />
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="phone">Teléfono:</label>
                                <input type="text" className='rounded-full' id="phone" name="phone" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} required />
                            </div>

                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="otherPhone">Otro Teléfono:</label>
                                <input type="text" className='rounded-full' id="otherPhone" name="otherPhone" value={client.other_phone} onChange={(e) => setClient({ ...client, other_phone: e.target.value })} />
                            </div>

                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="email">Email:</label>
                                <input type="text" className='rounded-full' id="email" name="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="relationship">Parentesco:</label>
                                {isYounger(client?.birthdate) === true ? (
                                    <select id="relationship" className='rounded-full' value={client.relationship} onChange={(e) => setClient({ ...client, relationship: e.target.value })} required>
                                        <option value="">--Selecciona una opción--</option>
                                        <option value="AB">Abuelo/a</option>
                                        <option value="BA">Bisabuelo/a</option>
                                        <option value="BN">Bisnieto/a</option>
                                        <option value="CD">Cuñado/a</option>
                                        <option value="CY">Cónyuge</option>
                                        <option value="HJ">Hijo/a</option>
                                        <option value="HR">Hermano/a</option>
                                        <option value="NI">Nieto/a</option>
                                        <option value="PM">Padre o madre</option>
                                        <option value="SB">Sobrino/a</option>
                                        <option value="SG">Suegro/a</option>
                                        <option value="TI">Tío/a</option>
                                        <option value="YN">Yerno o nuera</option>
                                        <option value="TU">Tutor/a</option>
                                        <option value="OT">Otro</option>
                                    </select>
                                ) : (
                                    <select id="relationship" className='rounded-full' value={client.relationship} onChange={(e) => setClient({ ...client, relationship: e.target.value })}>
                                        <option value="">--Selecciona una opción--</option>
                                        <option value="AB">Abuelo/a</option>
                                        <option value="BA">Bisabuelo/a</option>
                                        <option value="BN">Bisnieto/a</option>
                                        <option value="CD">Cuñado/a</option>
                                        <option value="CY">Cónyuge</option>
                                        <option value="HJ">Hijo/a</option>
                                        <option value="HR">Hermano/a</option>
                                        <option value="NI">Nieto/a</option>
                                        <option value="PM">Padre o madre</option>
                                        <option value="SB">Sobrino/a</option>
                                        <option value="SG">Suegro/a</option>
                                        <option value="TI">Tío/a</option>
                                        <option value="YN">Yerno o nuera</option>
                                        <option value="TU">Tutor/a</option>
                                        <option value="OT">Otro</option>
                                    </select>
                                )
                                }
                            </div>


                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="line">Direccion:</label>
                                <input type="text" className='rounded-full' id="line" name="line" value={client.address?.line || ''} onChange={(e) => setClient({ ...client, address: { ...client.address, line: e.target.value } })} />
                            </div>

                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="line2">Direccion adicional:</label>
                                <input type="text" className='rounded-full' id="line2" name="line2" value={client.address?.line2 || ''} onChange={(e) => setClient({ ...client, address: { ...client.address, line2: e.target.value } })} />
                            </div>

                            <div className="grid grid-cols-1">
                                <label className='rounded-full text-gray-dark text-opacity-75' id="country">Pais:</label>
                                <select
                                    className="rounded-full"
                                    id="selector-country"
                                    value={client.address?.country || ''}
                                    onChange={(e) => setClient({ ...client, address: { ...client.address, country: e.target.value } })}

                                >
                                    <option value="">-- Elige un país --</option>
                                    {paises.map(p => (
                                        <option key={p.codigo} value={p.codigo}>{p.pais}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="province">Provincia:</label>
                                <input type="text" className='rounded-full' id="province" name="province" value={client.address?.province || ''} onChange={(e) => setClient({ ...client, address: { ...client.address, province: e.target.value } })} />
                            </div>
                            {client.address?.country === "ESP" ? (
                                <div className="grid grid-cols-1">
                                    <label className='text-gray-dark text-opacity-75' id="location">Municipio:</label>
                                    <select
                                        className="rounded-full"
                                        id="selector-location"
                                        value={client.address?.location || ''}
                                        onChange={(e) => setClient({ ...client, address: { ...client.address, location: e.target.value } })}
                                    >
                                        <option value="">-- Elige un municipio --</option>
                                        {municipios.map(p => (
                                            <option key={p.codigo} value={p.codigo}>{p.municipio}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1">
                                    <label className='text-gray-dark text-opacity-75' id="location">Municipio:</label>
                                    <input type="text" className='rounded-full' id="location" name="location" value={client.address?.location || ''} onChange={(e) => setClient({ ...client, address: { ...client.address, location: e.target.value } })} />
                                </div>
                            )}

                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="postalCode">Código postal:</label>
                                <input type="number" className='rounded-full' id="postalCode" name="postalCode" value={client.address?.postalCode || ''} onChange={(e) => setClient({ ...client, address: { ...client.address, postalCode: Number(e.target.value) } })} required />
                            </div>
                        </div>
                        <div className="mt-10" id="boton-enviar">
                            <button className='rounded-full bg-green bg-opacity-50 text-gray-dark text-opacity-75' type="submit">
                                <label className='text-gray-dark text-opacity-75'>Actualizar</label>
                            </button>
                        </div>
                    </form>
                </div>) : <></>}
        </>
    )
}