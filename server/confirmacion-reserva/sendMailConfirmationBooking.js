const nodemailer = require("nodemailer");
const fs = require('fs');
const readProperty = require('../configuration/readConfiguration');


const sendConfirmationBookingMail = (confirmationNumber, client, reserva) => {
    console.log("Send mail for booking: ", confirmationNumber);

    const pass = readProperty("mail.reservas.password");
    const user = readProperty("mail.reservas.user");
    
    let roomType = "";
    let roomtypes = [];
    let supletoria = false;
    let numSupletoria = 0;
    let numHabitaciones = 0;
    for (var i = 0; i < reserva.habitaciones.length; i++) {
        if(i !==0 ){
            roomType = roomType + ", ";
        }

        if (reserva.habitaciones[i].habitacion != null) {
            switch (reserva.habitaciones[i].habitacion) {
                case "O Faiado":
                    roomType = roomType + "Habitación doble";
                    break;
                case "O Cuberto":
                    roomType = roomType + "Apartamento";
                    break;
                case "A Fonte":
                case "O Carpinteiro":
                    roomType = roomType + "Habitación doble con terraza";
                    break;
            }
            numHabitaciones += 1;

            if (reserva.habitaciones[i].supletorias != null && reserva.habitaciones[i].supletorias > 0) {
                supletoria = true;
                numSupletoria = numSupletoria + parseInt(reserva.habitaciones[i].supletorias);
            }
        }

        roomtypes.push({"tipo_habitacion": roomType, "num_supletorias": numSupletoria})

    }

    let specialRequest = "No aplica";
    if (supletoria) {
        if (numSupletoria > 1) {
            specialRequest = "Se solicita añadir a la reserva " + numSupletoria + " camas supletorias";
        } else {
            specialRequest = "Se solicita añadir a la reserva una cama supletoria";
        }
    }

    let habitacionesTexto = "";
    if(numHabitaciones>1){
        habitacionesTexto = "<br />Número de habitaciones: " + numHabitaciones + "<br />Tipos de habitaci&oacute;n: " + roomType
    }else{
        habitacionesTexto = "<br />Tipo de habitaci&oacute;n: " + roomType;
    }
    
    let bodyHtml = "<p dir=\"auto\">Hola " + client.nombre + " " + client.apellidos + "</p>\n<p dir=\"auto\">Gracias por elegir Casa de Miranda. </p>\n<p dir=\"auto\">Aqu&iacute; est&aacute;n los detalles de tu reserva:</p>\n<p dir=\"auto\">N&uacute;mero de confirmaci&oacute;n: " + confirmationNumber + habitacionesTexto + "<br />Fecha de llegada: " + reserva.fechaCheckIn + "<br />Fecha de salida: " + reserva.fechaCheckOut + "<br />Petici&oacute;n especial: " + specialRequest + " <br />Direcci&oacute;n: &Eacute;zaro, 357, 15297 Dumbr&iacute;a, La Coru&ntilde;a</p>\n<p dir=\"auto\">Si necesitas hacer cambios o requieres asistencia, por favor llama 659134018 o m&aacute;ndanos un correo a&nbsp;<a href=\"mailto:contacto@casademiranda.com\">contacto@casademiranda.com</a>.</p>\n<p dir=\"auto\">&iexcl;Tenemos muchas ganas de recibirte!</p>\n<p dir=\"auto\">Joaquina Castro</p>\n<p dir=\"auto\">Casa de Miranda</p>\n<p>&nbsp;&nbsp;&nbsp;<a href=\"https://www.casademiranda.com/\"><img src=\"cid:casademiranda\" style=\"width:250px;height:200px;\"></a></p>\n<p>&nbsp;&nbsp;&nbsp;<a href=\"https://www.instagram.com/casademiranda_ezaro/\"><img src=\"cid:instagram\" style=\"width:30px;height:30px;\"></a> &nbsp;&nbsp;&nbsp;<a href=\"https://www.facebook.com/people/Casa-de-Miranda/100083936833287/\"><img src=\"cid:facebook\" style=\"width:30px;height:30px;\"></a></p>\n"

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
        from: '"Reservas Casa de Miranda" <reservas@casademiranda.com>',
        to: client.email,
        cc: "casademirandaezaro@gmail.com",
        subject: 'Tu reserva en Casa de Miranda está confirmada. Confirmación ' + confirmationNumber,
        html: bodyHtml,
        attachments: [
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

module.exports = sendConfirmationBookingMail;