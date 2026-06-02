import { Client } from '@/interfaces/client'
import Link from 'next/link'
import DateComponent from '@/components/dates/dateComponent'

type ClientProps = {
    client: Client
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-xs text-gray uppercase tracking-wide">{label}</p>
            <p className="text-gray-dark font-medium">{value || '—'}</p>
        </div>
    );
}

export default function ClientComponent({ client }: ClientProps) {
    return (
        <div className="border border-gray-light rounded-lg p-4 mb-3">

            {/* Cabecera: nombre + botones */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-dark font-semibold">
                    {client.name} {client.firstSurname} {client.secondSurname}
                </h3>
                <div className="flex gap-2">
                    <Link
                        className="inline-flex items-center gap-1 rounded-full bg-green bg-opacity-50 text-gray-dark text-opacity-75 px-3 py-1 text-xs font-semibold"
                        href={"/client/update-client/[id]?booking_id=" + client.booking_id}
                        as={`/client/update-client/${client.client_id}?booking_id=${client.booking_id}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                        </svg>
                        Editar
                    </Link>
                    <Link
                        className="inline-flex items-center gap-1 rounded-full bg-orange bg-opacity-50 text-gray-dark text-opacity-75 px-3 py-1 text-xs font-semibold"
                        href={"/client/update-client/[id]?booking_id=" + client.booking_id}
                        as={`/client/delete-client/${client.client_id}?booking_id=${client.booking_id}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                        Eliminar
                    </Link>
                </div>
            </div>

            {/* Datos personales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <Field label="Género" value={client.gender} />
                <Field label="Nacionalidad" value={client.nacionality} />
                <Field label="Parentesco" value={client.relationship} />
                <DateComponent label="Fecha nacimiento" date={client.birthdate} />
            </div>

            {/* Documento */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <Field label="Tipo documento" value={client.document_type} />
                <Field label="Número documento" value={client.document_number} />
                <Field label="Soporte documento" value={client.support_document} />
                <DateComponent label="Fecha expedición" date={client.expedition_date} />
            </div>

            {/* Contacto */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <Field label="Teléfono" value={client.phone} />
                <Field label="Otro teléfono" value={client.other_phone} />
                <Field label="Email" value={client.email} />
                <DateComponent label="Fecha check-in" date={client.check_in} />
            </div>

            {/* Dirección */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Field label="Dirección" value={client.address?.line} />
                <Field label="Dir. adicional" value={client.address?.line2} />
                <Field label="País" value={client.address?.country} />
                <Field label="Provincia" value={client.address?.province} />
                <Field label="Municipio" value={client.address?.location} />
                <Field label="Código postal" value={client.address?.postalCode} />
            </div>

        </div>
    );
}
