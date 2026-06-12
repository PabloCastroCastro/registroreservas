import readProperty from '../configuration/readConfiguration.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const codigoEstablecimiento = readProperty('codigoEstablecimiento');

const templateContrato = `
            <contrato>
                <referencia>{{referencia}}</referencia>
                <fechaContrato>{{fechaContrato}}</fechaContrato>
                <fechaEntrada>{{fechaEntrada}}</fechaEntrada>
                <fechaSalida>{{fechaSalida}}</fechaSalida>
                <numPersonas>{{numPersonas}}</numPersonas>
                <numHabitaciones>{{numHabitaciones}}</numHabitaciones>
                <internet>true</internet>
                <pago>
                    <tipoPago>{{tipoPago}}</tipoPago>
                </pago>
            </contrato>`;

const templatePersona = `
            <persona>
                <rol>VI</rol>
                <nombre>{{nombre}}</nombre>
                <apellido1>{{apellido1}}</apellido1>
                <apellido2>{{apellido2}}</apellido2>
                <tipoDocumento>{{tipoDocumento}}</tipoDocumento>
                <numeroDocumento>{{numeroDocumento}}</numeroDocumento>
                <soporteDocumento>{{soporteDocumento}}</soporteDocumento>
                <fechaNacimiento>{{fechaNacimiento}}</fechaNacimiento>
                <nacionalidad>{{nacionalidad}}</nacionalidad>
                <sexo>{{sexo}}</sexo>
                <direccion>
                    <direccion>{{direccion}}</direccion>
                    <direccionComplementaria>{{direccionComplementaria}}</direccionComplementaria>
                    <codigoMunicipio>{{codigoMunicipio}}</codigoMunicipio>
                    <nombreMunicipio>{{nombreMunicipio}}</nombreMunicipio>
                    <codigoPostal>{{codigoPostal}}</codigoPostal>
                    <pais>{{pais}}</pais>
                </direccion>
                <telefono>{{telefono}}</telefono>
                <telefono2>{{telefono2}}</telefono2>
                <correo>{{correo}}</correo>
                <parentesco>{{parentesco}}</parentesco>
            </persona>`;

// DB stores M=male, F=female. SES API uses H=Hombre, M=Mujer.
function mapSexo(gender) {
    if (gender === 'M') return 'H';
    if (gender === 'F') return 'M';
    return gender;
}

// DB stores EFECTIVO/TARJETA; SES requires String(5) codes.
const PAGO_MAP = {
    EFECTIVO: 'EFECT',
    TARJETA:  'TARJT',
};
function mapTipoPago(tipoPago) {
    return PAGO_MAP[tipoPago] ?? tipoPago;
}

// codigoMunicipio requires a 5-digit INE code (Spain only).
// If we only have a text name, fall back to nombreMunicipio.
function municipioFields(country, location) {
    const isIneCode = country === 'ESP' && /^\d{5}$/.test((location ?? '').trim());
    const isSpain = country === 'ESP';
    return {
        codigoMunicipio: isIneCode ? location.trim() : null,
        // spec: nombreMunicipio must NOT appear when country is Spain
        nombreMunicipio: isSpain ? null : location,
    };
}

function fillXmlTemplate(xmlTemplate, values) {
    return xmlTemplate
        .split('\n')
        .map(line => {
            const matches = [...line.matchAll(/{{\s*(\w+)\s*}}/g)];
            for (const match of matches) {
                const key = match[1];
                const value = values[key];
                if (value === undefined || value === null || value === '') return null;
            }
            return line.replace(/{{\s*(\w+)\s*}}/g, (_, key) => String(values[key]));
        })
        .filter(line => line !== null)
        .join('\n');
}

function toIsoDateString(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function toIsoDatetimeString(date) {
    return new Date(date).toISOString().split('.')[0];
}

export function buildComunicacionXml(booking, customers) {
    const datos = {
        referencia: booking.confirmation_number,
        fechaContrato: toIsoDateString(booking.check_out),
        fechaEntrada: toIsoDatetimeString(booking.check_in),
        fechaSalida: toIsoDatetimeString(booking.check_out),
        numPersonas: customers.length,
        numHabitaciones: booking.rooms?.length ?? 1,
        tipoPago: mapTipoPago(booking.payment_type),
    };

    const generalesXml = fillXmlTemplate(templateContrato, datos);
    const personasXml = customers.map(p => {
        const { codigoMunicipio, nombreMunicipio } = municipioFields(p.country, p.location);
        return fillXmlTemplate(templatePersona, {
            nombre: p.name,
            apellido1: p.surname,
            apellido2: p.surname2,
            tipoDocumento: p.document_type,
            numeroDocumento: p.identifier,
            soporteDocumento: p.support_document,
            fechaNacimiento: toIsoDateString(p.birthdate),
            nacionalidad: p.nacionality,
            sexo: mapSexo(p.gender),
            direccion: p.line,
            direccionComplementaria: p.line2,
            codigoMunicipio,
            nombreMunicipio,
            codigoPostal: p.postalCode,
            pais: p.country,
            telefono: p.phone,
            telefono2: p.other_phone,
            correo: p.email,
            parentesco: p.relationship,
        });
    }).join('\n');

    return `        <comunicacion>\n${generalesXml}\n${personasXml}\n        </comunicacion>`;
}

export function buildDailyXml(comunicaciones) {
    return `<ns2:peticion xmlns:ns2="http://www.neg.hospedajes.mir.es/altaParteHospedaje">
    <solicitud>
        <codigoEstablecimiento>${codigoEstablecimiento}</codigoEstablecimiento>
${comunicaciones.join('\n')}
    </solicitud>
</ns2:peticion>`;
}

export const saveCheckIn = async (booking, customers) => {
    const comunicacion = buildComunicacionXml(booking, customers);
    const resultado = buildDailyXml([comunicacion]);

    console.log(resultado);
    saveXmlToFile(resultado, booking.confirmation_number);
    return resultado;
};

function saveXmlToFile(xmlContent, confirmation_number) {
    const fileName = confirmation_number + '.xml';
    const dirPath = path.join(__dirname, '../check-in');
    const outputPath = path.join(dirPath, fileName);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(outputPath, xmlContent, 'utf-8');
    console.log(`[checkIn] XML guardado en: ${outputPath}`);
}
