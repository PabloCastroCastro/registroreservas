'use client';

import "@/app/globals.css";

import { useEffect, useState } from 'react';
import Navbar from '@/components/navbar/navbar';
import * as APIClient from '@/services/clients';
import type { Address, Client } from '@/interfaces/client';
import { useRouter } from 'next/router';

type Country = {
    pais: string;
    codigo: string;
};

type Location = {
    codigo: string;
    municipio: string;
};

export default function NewClient() {

    const { query } = useRouter()

    const [checkIn, setCheckIn] = useState("");
    const [nacionality, setNacionality] = useState("");
    const [documentType, setDocumentType] = useState("");
    const [documentNumber, setDocumentNumber] = useState("");
    const [expeditionDate, setExpeditionDate] = useState("");
    const [name, setName] = useState("");
    const [firstSurname, setFistSurname] = useState("");
    const [secondSurname, setSecondSurname] = useState("");
    const [gender, setGender] = useState("");
    const [birthdate, setBirthdate] = useState("");
    const [supportDocument, setSupportDocument] = useState("");
    const [phone, setPhone] = useState("");
    const [otherPhone, setOtherPhone] = useState("");
    const [email, setEmail] = useState("");
    const [relationship, setRelationship] = useState("");
    const [line, setLine] = useState("");
    const [line2, setLine2] = useState("");
    const [country, setCountry] = useState("");
    const [province, setProvince] = useState("");
    const [location, setLocation] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [bookingId, setBookingId] = useState(query !== undefined && query.booking_id !== undefined && typeof (query.booking_id) === "string" ? query.booking_id : "");
    const [municipios, setMunicipios] = useState<Location[]>([]);
    const [municipioSelectedCodigo, setMunicipioSelectedCodigo] = useState("");
    const [paises, setPaises] = useState<Country[]>([]);
    const [countryCodeSelected, setCountryCodeSelected] = useState("");
    const [younger, setYounger] = useState(false);
    const [client, setClient] = useState<Client>();

    const validData = (client: Client) => {
        return true;
    }

    const isYounger = (fecha: string): boolean => {
        if (!fecha) return false;
        const nacimiento = new Date(fecha);
        const hoy = new Date();
        const edad = hoy.getFullYear() - nacimiento.getFullYear();
        const cumpleEsteAño = hoy.getMonth() > nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() >= nacimiento.getDate());
        return edad < 18 || (edad === 17 && cumpleEsteAño);
    };

    const handleSubmit = () => {

        let address: Address = {
            line: line,
            line2: line2,
            country: country,
            province: province,
            location: location,
            postalCode: parseInt(postalCode, 10)
        }

        let client: Client = {
            client_id: "",
            check_in: new Date(checkIn),
            nacionality: nacionality,
            document_type: documentType,
            document_number: documentNumber,
            support_document: supportDocument,
            expedition_date: new Date(expeditionDate),
            name: name,
            firstSurname: firstSurname,
            secondSurname: secondSurname,
            gender: gender,
            birthdate: new Date(birthdate),
            phone: phone,
            other_phone: otherPhone,
            email: email,
            relationship: relationship,
            booking_id: bookingId,
            address: address,
            made_booking: false
        };

        if (!validData(client)) {

            alert('Los datos del cliente no son validos')
            return new Error('Invalid client data')
        }

        console.log(JSON.stringify(client), 'Reserva Id: ', query.booking_id);
        APIClient.createClient(client).then(res => {
            return setClient(res)
        }).catch(console.log);

    }

    useEffect(() => {
        fetch("/municipios.json")
            .then((res) => res.json())
            .then((data) => setMunicipios(data))
            .catch((err) => console.error(err));
        fetch("/paises-alpha3.json")
            .then((res) => res.json())
            .then((data) => setPaises(data))
            .catch((error) => console.error("Error cargando países:", error));
    }, []);

    return (
        <>
            <Navbar></Navbar>
            <div id="titulo" className='px-4 md:px-5'>
                <h1 className='relative text-xl text-green text-opacity-75 font-semibold'>Nuevo Cliente:</h1>
            </div>
            <div id="datos-cliente" className='mt-5 px-4 md:px-10 grid grid-cols-1 gap-2'>
                <form id="mi-formulario" onSubmit={handleSubmit}>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="fecha-checkin">Fecha de check-in:</label>
                            <input type="date" className='rounded-full' id="fecha-checkin" name="fechaCheckIn" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-1">
                            <label className='rounded-full text-gray-dark text-opacity-75' id="nacionality">Nacionalidad:</label>
                            <select
                                className="rounded-full"
                                id="selector-nacionality"
                                value={nacionality || ''}
                                onChange={(e) => setNacionality(e.target.value)}
                            >
                                <option value="">-- Elige un país --</option>
                                {paises.map(p => (
                                    <option key={p.codigo} value={p.codigo}>{p.pais}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="documentType">Tipo documento:</label>
                            <select name="documentType" id="documentType" className='rounded-full' onChange={e => { setDocumentType(e.target.value); }} value={documentType} required>
                                <option value="NIF">NIF - Número de Identificación Fiscal</option>
                                <option value="NIE">NIE - Número de Identidad de Extranjero</option>
                                <option value="PAS">PAS - Número de pasaporte</option>
                                <option value="OTRO">Otro</option>
                            </select>
                        </div>
                        
                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="documentNumber">Número documento:</label>
                            <input type="text" className='rounded-full' id="documentNumber" name="documentNumber" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} required />
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="supportDocument">Soporte documento:</label>
                            <input type="text" className='rounded-full' id="supportDocument" name="supportDocument" value={supportDocument} onChange={(e) => setSupportDocument(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="expeditionDate">Fecha de expedición:</label>
                            <input type="date" className='rounded-full' id="expeditionDate" name="expeditionDate" value={expeditionDate} onChange={(e) => setExpeditionDate(e.target.value)} required />
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="nombre">Nombre:</label>
                            <input type="text" className='rounded-full' id="nombre" name="nombre" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="firstSurname">Primer apellido:</label>
                            <input type="text" className='rounded-full' id="firstSurname" name="firstSurname" value={firstSurname} onChange={(e) => setFistSurname(e.target.value)} required />
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="secondSurname">Segundo apellido:</label>
                            <input type="text" className='rounded-full' id="secondSurname" name="secondSurname" value={secondSurname} onChange={(e) => setSecondSurname(e.target.value)} required />
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="gender">Genero:</label>
                            <select id="selectorGender" className='rounded-full' onChange={e => { setGender(e.target.value); }} value={gender} name="gender">
                                <option value="">--Selecciona una opción--</option>
                                <option value="M">Masculino</option>
                                <option value="F">Femenino</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="birthdate">Fecha de nacimiento:</label>
                            <input type="date" className='rounded-full' id="birthdate" name="birthdate" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} required />
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="phone">Teléfono:</label>
                            <input type="text" className='rounded-full' id="phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="otherPhone">Otro Teléfono:</label>
                            <input type="text" className='rounded-full' id="otherPhone" name="otherPhone" value={otherPhone} onChange={(e) => setOtherPhone(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="email">Email:</label>
                            <input type="text" className='rounded-full' id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        
                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="relationship">Parentesco:</label>
                            {isYounger(birthdate) === true ? (
                                <select id="relationship" className='rounded-full' onChange={e => { setRelationship(e.target.value); }} value={relationship} name="relationship" required>
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
                                <select id="relationship" className='rounded-full' onChange={e => { setRelationship(e.target.value); }} value={relationship} name="relationship">
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
                            <input type="text" className='rounded-full' id="line" name="line" value={line} onChange={(e) => setLine(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="line2">Direccion adicional:</label>
                            <input type="text" className='rounded-full' id="line2" name="line2" value={line2} onChange={(e) => setLine2(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='rounded-full text-gray-dark text-opacity-75' id="country">Pais:</label>
                            <select
                                className="rounded-full"
                                id="selector-country"
                                value={country || ''}
                                onChange={(e) => setCountry(e.target.value)}
                            >
                                <option value="">-- Elige un país --</option>
                                {paises.map(p => (
                                    <option key={p.codigo} value={p.codigo}>{p.pais}</option>
                                ))}
                            </select>
                        </div>
                        {country === "ESP" ? (
                            <div className="grid grid-cols-1">
                                <label className='text-gray-dark text-opacity-75' id="location">Municipio:</label>
                                <select
                                    className="rounded-full"
                                    id="selector-location"
                                    value={location || ''}
                                    onChange={(e) => setLocation(e.target.value)}
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
                                <input type="text" className='rounded-full' id="location" name="location" value={location} onChange={(e) => setLocation(e.target.value)} />
                            </div>
                        )}
                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="province">Provincia:</label>
                            <input type="text" className='rounded-full' id="province" name="province" value={province} onChange={(e) => setProvince(e.target.value)} />
                        </div>

                        <div className="grid grid-cols-1">
                            <label className='text-gray-dark text-opacity-75' id="postalCode">Código postal:</label>
                            <input type="number" className='rounded-full' id="postalCode" name="postalCode" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                        </div>


                    </div>
                    <div className="mt-10" id="boton-enviar">
                        <button className='rounded-full bg-green bg-opacity-50 text-gray-dark text-opacity-75' type="submit"><label className='text-gray-dark text-opacity-75' >Registro cliente</label></button>
                    </div>
                </form>
            </div>
        </>
    )
}
