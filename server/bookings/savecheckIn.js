import readProperty from '../configuration/readConfiguration.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Reemplazo de __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const codigoEstablecimiento = readProperty("codigoEstablecimiento");


const saveCheckIn = async (booking, customers) => {

    const templateContrato =
        `
        <contrato>
            <referencia>{{referencia}}</referencia>
            <fechaContrato>{{fechaContrato}}</fechaContrato>
            <fechaEntrada>{{fechaEntrada}}</fechaEntrada>
            <fechaSalida>{{fechaSalida}}</fechaSalida>
            <numPersonas>{{numPersonas}}</numPersonas>
            <numHabitaciones>{{numHabitaciones}}</numHabitaciones>
            <internet>true</internet>
            <pago>
                <!--Tipos de pago: [DESTI, EFECT, TARJT, PLATF, TRANS, MOVIL, TREG, OTRO]-->
                <tipoPago>{{tipoPago}}</tipoPago>
            </pago>
        </contrato>
        `;

    const templatePersona = `
        <persona>
            <rol>VI</rol>
            <nombre>{{nombre}}</nombre>
            <apellido1>{{apellido1}}</apellido1>
            <apellido2>{{apellido2}}</apellido2>
            <tipoDocumento>{{tipoDocumento}}</tipoDocumento>
            <numeroDocumento>{{numeroDocumento}}</numeroDocumento>
            <fechaNacimiento>{{fechaNacimiento}}</fechaNacimiento>
            <nacionalidad>{{nacionalidad}}</nacionalidad>
            <sexo>{{sexo}}</sexo>
            <direccion>
                <direccion>{{direccion}}</direccion>
                <direccionComplementaria>{{direccionComplementaria}}</direccionComplementaria>
                <codigoMunicipio>{{municipio}}</codigoMunicipio>
                <nombreMunicipio>{{municipio}}</nombreMunicipio>
                <codigoPostal>{{codigoPostal}}</codigoPostal>
                <pais>{{pais}}</pais>
            </direccion>
            <telefono>{{telefono}}</telefono>
            <telefono2>{{telefono2}}</telefono2>
            <correo>{{correo}}</correo>
        </persona>
        `;

    const datos = {
        referencia: booking.confirmation_number,
        fechaContrato: toIsoDateString(booking.check_out),
        fechaEntrada: toIsoDatetimeString(booking.check_in),
        fechaSalida: toIsoDatetimeString(booking.check_out),
        numPersonas: customers.length,
        numHabitaciones: booking.rooms.length,
        tipoPago: booking.payment_type

    };


    const generalesXml = fillXmlTemplate(templateContrato, datos);
    const personasXml = customers.map(p => fillXmlTemplate(templatePersona, {
        nombre: p.name,
        apellido1: p.surname,
        apellido2: p.surname2,
        tipoDocumento: p.document_type,
        numeroDocumento: p.identifier,
        soporteDocumento: p.support_document,
        fechaNacimiento: toIsoDateString(p.birthdate),
        nacionalidad: p.nacionality, 
        sexo: p.gender,
        direccion: p.line,
        direccionComplementaria: p.line2,
        municipio: p.location,
        codigoPostal: p.postalCode,
        pais: p.country,
        telefono: p.phone, 
        telefono2: p.other_phone,
        correo: p.email,
        parentesco: p.relationship
    })).join('\n');



    const resultado = `<ns2:peticion xmlns:ns2="http://www.neg.hospedajes.mir.es/altaParteHospedaje">
        <solicitud>
            <establecimiento>
                <codigo>${codigoEstablecimiento}</codigo>
            </establecimiento>
            <comunicacion>
                ${generalesXml}
                ${personasXml}
            </comunicacion>
        </solicitud>
        </ns2:peticion>`

    console.log(resultado);
    saveXmlToFile(resultado, booking.confirmation_number)
    return resultado;
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

function fillXmlTemplate(xmlTemplate, values) {
  return xmlTemplate
    .split('\n')
    .map(line => {
      if (line.includes('<nombreMunicipio>{{municipio}}</nombreMunicipio>') && values['pais'] === 'ESP') {
        return null; 
      }
      if (line.includes('<codigoMunicipio>{{municipio}}</codigoMunicipio>') && values['pais'] !== 'ESP') {
        return null; 
      }

      const matches = [...line.matchAll(/{{\s*(\w+)\s*}}/g)];

      for (const match of matches) {
        const key = match[1];
        const value = values[key];
        if (value === undefined || value === null || value === '') {
          return null;
        }
      }

      return line.replace(/{{\s*(\w+)\s*}}/g, (_, key) => String(values[key]));
    })
    .filter(line => line !== null)
    .join('\n');
}

function saveXmlToFile(xmlContent, confirmation_number) {
    const fileName = confirmation_number + '.xml';

    const dirPath = path.join(__dirname, '../check-in');
    const outputPath = path.join(dirPath, fileName);

    // Asegura que el directorio existe
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(outputPath, xmlContent, 'utf-8');
    console.log(`Archivo guardado en: ${outputPath}`);
}

export { saveCheckIn };