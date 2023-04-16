const PDFDocument = require('pdfkit');
const fs = require('fs');

const generarFactura = (reserva, cliente) => {


    // Create a document
    const doc = new PDFDocument();

    // Pipe its output somewhere, like to a file or HTTP response
    doc.pipe(fs.createWriteStream('./facturas-cliente/' + reserva.numeroFactura + '.pdf'));

    // line cap settings
    doc.lineCap('butt')
        .moveTo(0, 0)
        .lineTo(700, 0)
        .lineWidth(10)
        .fillAndStroke('green');

    // Add some content to the document
    doc.font('Times-Roman')
        .fontSize(24)
        .fillColor('green')
        .text('Casa de Miranda', 75, 50)

    doc.font('Times-Bold')
        .fontSize(12)
        .fillColor('#154360')
        .text('Número Factura: ' + reserva.numeroFactura, 375, 62)

    doc.fontSize(10)
        .fillColor('grey')
        .text('Lugar Ézaro', 75, 80);

    doc.fontSize(10)
        .fillColor('grey')
        .text('15297, A Coruña', 75, 91);

    doc.fontSize(10)
        .fillColor('grey')
        .text('(+34) 659134018', 75, 102);

    doc.font('Times-Bold')
        .fontSize(20)
        .fillColor('#154360')
        .text('Reserva', 75, 150);

    doc.font('Times-Roman')
        .fontSize(12)
        .fillColor('green')
        .text('Fecha: ' + reserva.fechaReserva, 75, 176);

    doc.font('Times-Bold')
        .fontSize(12)
        .fillColor('#1B2631')
        .text('Nombre cliente:', 75, 210);
    doc.font('Times-Bold')
        .fontSize(12)
        .fillColor('#1B2631')
        .text('Dni:', 200, 210);
    doc.font('Times-Bold')
        .fontSize(12)
        .fillColor('#1B2631')
        .text('Check-in:', 300, 210);
    doc.font('Times-Bold')
        .fontSize(12)
        .fillColor('#1B2631')
        .text('Check-out:', 400, 210);

    doc.font('Times-Roman')
        .fontSize(12)
        .fillColor('grey').text(cliente.nombre + ' ' + cliente.apellidos, 75, 224);
    doc.font('Times-Roman')
        .fontSize(12)
        .fillColor('grey').text(cliente.dni, 200, 224);
    doc.font('Times-Roman')
        .fontSize(12)
        .fillColor('grey').text(reserva.fechaCheckIn, 300, 224);
    doc.font('Times-Roman')
        .fontSize(12)
        .fillColor('grey').text(reserva.fechaCheckOut, 400, 224);

    doc.lineCap('butt')
        .moveTo(75, 275)
        .lineTo(525, 275)
        .lineWidth(1)
        .fillAndStroke('grey');

    doc.font('Times-Bold')
        .fontSize(12)
        .fillColor('#154360').text('Descripción', 75, 300);

    doc.font('Times-Bold')
        .fontSize(12)
        .fillColor('#154360').text('Cantidad', 300, 300);

    doc.font('Times-Bold')
        .fontSize(12)
        .fillColor('#154360').text('Precio unitario', 370, 300);

    doc.font('Times-Bold')
        .fontSize(12)
        .fillColor('#154360').text('Precio total', 465, 300);


    //entradas de habitaciones
    const start = 320;
    var index = 320;
    var color = '#E5E8E8';
    var importeTotal = 0;
    for (var i = 0; i < reserva.habitaciones.length; i++) {

        doc.lineCap('butt')
            .moveTo(75, index)
            .lineTo(525, index)
            .lineWidth(15)
            .fillOpacity(0.8)
            .fillAndStroke(color);


        doc.font('Times-Roman')
            .fontSize(10)
            .fillColor('#1B2631').text('Habitación Doble (' + reserva.habitaciones[i].habitacion + ')', 76, index - 4);

        doc.font('Times-Roman')
            .fontSize(10)
            .fillColor('#1B2631').text(reserva.dias, 342, index - 4);

        doc.font('Times-Roman')
            .fontSize(10)
            .fillColor('#1B2631').text(reserva.habitaciones[i].precio + ' €', 422, index - 4);

        doc.font('Times-Roman')
            .fontSize(10)
            .fillColor('#1B2631').text(reserva.dias * reserva.habitaciones[i].precio + ' €', 506, index - 4);

        importeTotal = importeTotal +(reserva.dias * reserva.habitaciones[i].precio);
        if (color == '#E5E8E8') {
            color = 'white';
        } else {
            color = '#E5E8E8';
        }

        index = index + 15

        doc.lineCap('butt')
            .moveTo(75, index)
            .lineTo(525, index)
            .lineWidth(15)
            .fillOpacity(0.8)
            .fillAndStroke(color);

        // desayunos
        doc.font('Times-Roman')
            .fontSize(10)
            .fillColor('#1B2631').text('Desayuno incluido', 76, index - 4);

        doc.font('Times-Roman')
            .fontSize(10)
            .fillColor('#1B2631').text(reserva.dias, 342, index - 4);

        doc.font('Times-Roman')
            .fontSize(10)
            .fillColor('#1B2631').text('0,00 €', 415, index - 4);

        doc.font('Times-Roman')
            .fontSize(10)
            .fillColor('#1B2631').text('0,00 €', 500, index - 4);

        if (color == '#E5E8E8') {
            color = 'white';
        } else {
            color = '#E5E8E8';
        }

        index = index + 15

    }

    while (index < 455) {

        doc.lineCap('butt')
            .moveTo(75, index)
            .lineTo(525, index)
            .lineWidth(15)
            .fillOpacity(0.8)
            .fillAndStroke(color);

        if (color == '#E5E8E8') {
            color = 'white';
        } else {
            color = '#E5E8E8';
        }

        index = index + 15

    }

    doc.lineCap('butt')
        .moveTo(75, 455)
        .lineTo(525, 455)
        .lineWidth(15)
        .fillOpacity(0.8)
        .fillAndStroke(color);

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text('El precio incluye', 76, 451);

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text('10% IVA €', 480, 451);

    doc.lineCap('butt')
        .moveTo(75, 461)
        .lineTo(525, 461)
        .lineWidth(1)
        .fillAndStroke('grey');


    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#154360').text('Subtotal', 440, 470);

    doc.font('Times-Bold')
        .fontSize(10)
        .fillColor('#1B2631').text(importeTotal+' €', 495, 470);

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#154360').text('Ajustes', 440, 490);

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text('0,00 €', 500, 490);

    doc.font('Times-Bold')
        .fontSize(20)
        .fillColor('green').text(importeTotal+' €', 465, 510);

    // Finalize PDF file
    doc.end();

}

module.exports = generarFactura;