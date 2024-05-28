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
            <div id="botones" className='mt-5 ml-5 grid grid-cols-6 gap-3'>
                <Link className='rounded-full bg-green bg-opacity-50 hover:bg-gray-dark text-center text-gray-dark text-opacity-75 px-5 py-2.5' href={"/client/update-client/[id]?booking_id=" + client.booking_id} as={`/client/update-client/${client.client_id}?booking_id=${client.booking_id}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                    </svg>
                </Link>
                <Link className='rounded-full bg-green bg-opacity-50 hover:bg-gray-dark text-center text-gray-dark text-opacity-75 px-5 py-2.5' href={"/client/update-client/[id]?booking_id=" + client.booking_id} as={`/client/delete-client/${client.client_id}?booking_id=${client.booking_id}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                </Link> 
            </div>
        </div >
    )
}