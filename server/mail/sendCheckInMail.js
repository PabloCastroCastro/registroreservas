import nodemailer from 'nodemailer';
import readProperty from '../configuration/readConfiguration.js';

export async function sendCheckInMail(fecha, xmlContent, totalReservas) {
    const user = readProperty('mail.facturacion.user');
    const pass = readProperty('mail.facturacion.password');

    const transporter = nodemailer.createTransport({
        host: 'casademiranda-com.correoseguro.dinaserver.com',
        port: 465,
        secure: true,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
    });

    const fileName = `checkin_${fecha}.xml`;
    const resumen = totalReservas === 1
        ? '1 comunicación de viajeros'
        : `${totalReservas} comunicaciones de viajeros`;

    await transporter.sendMail({
        from: '"Facturacion Casa de Miranda" <facturacion@casademiranda.com>',
        to: 'casademirandaezaro@gmail.com',
        subject: `Check-in ${fecha} — ${resumen}`,
        text: `Se adjunta el XML de comunicación de viajeros del día ${fecha} (${resumen}) para subir al portal del Ministerio del Interior.`,
        attachments: [
            {
                filename: fileName,
                content: Buffer.from(xmlContent, 'utf-8'),
                contentType: 'application/xml',
            },
        ],
    });

    console.log(`[checkIn] XML del día ${fecha} enviado por email (${resumen})`);
}
