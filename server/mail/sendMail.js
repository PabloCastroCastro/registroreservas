const nodemailer = require("nodemailer");
const fs = require('fs');
const readProperty = require('../configuration/readConfiguration');


const sendMail = (idBooking, name, surname, email) => {
    console.log("Send mail for booking: ", idBooking);

    const pass = readProperty("mail.facturacion.password");
    const user = readProperty("mail.facturacion.user");
    let bodyHtml = "<p>Buenos días,</p><p>Se adjunta la factura número " + idBooking + " para el cliente " + name + " " + surname + ".</p><p>Muchas gracias.</p><p>Un saludo, </p><p dir=\"auto\">Joaquina Castro</p>\n<p dir=\"auto\">Casa de Miranda</p>\n<p>&nbsp;&nbsp;&nbsp;<a href=\"https://www.casademiranda.com/\"><img src=\"cid:casademiranda\" style=\"width:250px;height:200px;\"></a></p>\n<p>&nbsp;&nbsp;&nbsp;<a href=\"https://www.instagram.com/casademiranda_ezaro/\"><img src=\"cid:instagram\" style=\"width:30px;height:30px;\"></a> &nbsp;&nbsp;&nbsp;<a href=\"https://www.facebook.com/people/Casa-de-Miranda/100083936833287/\"><img src=\"cid:facebook\" style=\"width:30px;height:30px;\"></a></p>\n"

    let transporter = nodemailer.createTransport({
        host: "casademiranda-com.correoseguro.dinaserver.com",
        port: 465,
        secure: true,
        auth: {
            user: user,
            pass: pass,
        }
    });

    transporter.sendMail({
        from: '"Facturacion Casa de Miranda" <facturacion@casademiranda.com>',
        to: email,
        cc: "pablinho6699@gmail.com",
        subject: "Factura " + idBooking,
        html: bodyHtml,
        attachments: [
            {
                filename: idBooking + '.pdf',
                path: './facturas-cliente/' + idBooking + '.pdf',
                cid: idBooking
            },
            {
                filename: 'casademiranda.jpg',
                path: './confirmacion-reserva/sources/casademiranda.jpg',
                cid: 'casademiranda'
            },
            {
                filename: 'instagram.png',
                path: './confirmacion-reserva/sources/instagram.png',
                cid: 'instagram'
            },
            {
                filename: 'facebook.png',
                path: './confirmacion-reserva/sources/facebook.png',
                cid: 'facebook'
            }
        ]
    });

}

module.exports = sendMail;