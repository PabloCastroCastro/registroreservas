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
            <p><Link href="/client/update-client/[id]" as={`/client/update-client/${client.client_id}`}>{client.client_id}</Link></p>
            <p>{client.name}</p>
            <p>{client.firstSurname}</p>
            <p>{client.secondSurname}</p>
            <DateComponent dateProps={{label:"Fecha Nacimiento: ", date:client.birthdate}}></DateComponent>
            <p>{client.gender}</p>
            <p>{client.nacionality}</p>
            <p>{client.document_type}</p>
            <p>{client.document_number}</p>
            <DateComponent dateProps={{label:"Fecha Expedicion: ", date:client.expedition_date}}></DateComponent>
            <DateComponent dateProps={{label:"Check In: ", date:client.check_in}}></DateComponent>
            <Link href={"/client/update-client/[id]?booking_id="+client.booking_id} as={`/client/update-client/${client.client_id}?booking_id=${client.booking_id}`}><Button>Actualizar cliente</Button></Link>
        </div>
    )
}