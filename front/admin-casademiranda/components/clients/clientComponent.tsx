import { Client } from '@/interfaces/client'
import Link from 'next/link'
import DateComponent from '@/components/dates/dateComponent'
import { Button } from 'flowbite-react'

type ClientProps = {
    client: Client
}

export default function ClientComponent({ client }: ClientProps) {

    return (

        <div>
            <div id="datos-cliente" className='mt-5 ml-10 grid grid-cols-1 gap-2'>
                <div id="datos-comunes" className='grid grid-cols-3 gap-3'>
                    <div className="grid grid-cols-1">
                        <label className='text-gray-dark text-opacity-75' id="nombre">Nombre: {client.name}</label>
                    </div>
                    <div className="grid grid-cols-1">
                        <label className='text-gray-dark text-opacity-75' id="apellidos">Apellido 1: {client.firstSurname}</label>
                    </div>
                    <div className="grid grid-cols-1">
                        <label className='text-gray-dark text-opacity-75' id="apellidos">Apellido 2: {client.secondSurname}</label>
                    </div>
                    <div className="grid grid-cols-1">
                        <DateComponent label="Fecha Nacimiento: " date={client.birthdate} />
                    </div>
                    <div className="grid grid-cols-1">
                        <label className='text-gray-dark text-opacity-75' id="genero">Genero: {client.gender}</label>
                    </div>
                    <div className="grid grid-cols-1">
                        <label className='text-gray-dark text-opacity-75' id="nacionalidad">Nacionalidad: {client.gender}</label>
                    </div>
                    <div className="grid grid-cols-1">
                        <label className='text-gray-dark text-opacity-75' id="tipodocumento">Tipo documento: {client.document_type}</label>
                    </div>
                    <div className="grid grid-cols-1">
                        <label className='text-gray-dark text-opacity-75' id="numerodocumento">Numero documento: {client.document_number}</label>
                    </div>
                    <div className="grid grid-cols-1">
                        <DateComponent label="Fecha Expedicion: " date={client.expedition_date} />
                    </div>
                    <div className="grid grid-cols-1">
                        <DateComponent label="Fecha check in: " date={client.check_in} />
                    </div>
                </div>
            </div>
            <div id="botones" className='mt-5 ml-5 grid grid-cols-6 gap-3'>
                <div className="grid grid-cols-1">
                    <Link className='rounded-full bg-green bg-opacity-50 hover:bg-gray-dark text-center text-gray-dark text-opacity-75 px-5 py-2.5' href={"/client/update-client/[id]?booking_id=" + client.booking_id} as={`/client/update-client/${client.client_id}?booking_id=${client.booking_id}`}><label>Actualizar cliente</label></Link>
                </div>
            </div>
        </div >
    )
}