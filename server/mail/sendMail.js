const nodemailer = require("nodemailer");
const fs = require('fs');


const sendMail = (idBooking, name, surname) => {
    console.log("Send mail for booking: ", idBooking);

    const pass = fs.readFileSync('./password.txt', 'utf8');
    const user = "facturacion@casademiranda.com";
    let bodyHtml = "<p>Buenos días,</p><p>Se adjunta la factura número " + idBooking + " para el cliente " + name + " " + surname + ".</p><p>Muchas gracias.</p><p>Un saludo, </p><p>Casa de Miranda </p>"

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
        to: "pablinho6699@gmail.com",
        subject: "Factura " + idBooking,
        html: bodyHtml,
        attachments: [
            {
                path: './facturas-cliente/' + idBooking + '.pdf'
            }
        ]
    });

}

module.exports = sendMail;