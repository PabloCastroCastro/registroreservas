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

        let lengthDays = reserva.dias.toString().length * 5;
        doc.font('Times-Roman')
            .fontSize(10)
            .fillColor('#1B2631').text(reserva.dias, 345 - lengthDays, index - 4);

        let price = parseFloat(reserva.habitaciones[i].precio).toFixed(2);
        //cada letra en tamano 10 son 5px
        let lengthPrice = price.toString().length * 5;
        doc.font('Times-Roman')
            .fontSize(10)
            .fillColor('#1B2631').text(price + ' €', 440 - lengthPrice, index - 4);

        let totalRoomPrice = (reserva.dias * reserva.habitaciones[i].precio).toFixed(2);
        let lengthTotalRoomPrice = totalRoomPrice.toString().length * 5;
        doc.font('Times-Roman')
            .fontSize(10)
            .fillColor('#1B2631').text(totalRoomPrice + ' €', 520 - lengthTotalRoomPrice, index - 4);

        importeTotal = importeTotal + (reserva.dias * reserva.habitaciones[i].precio);
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

        //supletorias
        if (reserva.habitaciones[i].supletorias != null && reserva.habitaciones[i].supletorias > 0) {
            doc.font('Times-Roman')
                .fontSize(10)
                .fillColor('#1B2631').text('Supletoria', 76, index - 4);

            doc.font('Times-Roman')
                .fontSize(10)
                .fillColor('#1B2631').text(reserva.dias, 345 - lengthDays, index - 4);

            let extraBedPrice = parseFloat(reserva.habitaciones[i].precioSupletoria).toFixed(2);
            let extraBedPriceLength = extraBedPrice.toString().length * 5;
            doc.font('Times-Roman')
                .fontSize(10)
                .fillColor('#1B2631').text(extraBedPrice + ' €', 440 - extraBedPriceLength, index - 4);

            let totalExtraBedPrice = (reserva.dias * reserva.habitaciones[i].supletorias * reserva.habitaciones[i].precioSupletoria).toFixed(2);
            let lengthTotalExtraBedPrice = totalExtraBedPrice.toString().length * 5;
            doc.font('Times-Roman')
                .fontSize(10)
                .fillColor('#1B2631').text(totalExtraBedPrice + ' €', 520 - lengthTotalExtraBedPrice, index - 4);

            importeTotal = importeTotal + (reserva.dias * reserva.habitaciones[i].supletorias * reserva.habitaciones[i].precioSupletoria);
            if (color == '#E5E8E8') {
                color = 'white';
            } else {
                color = '#E5E8E8';
            }

            index = index + 15
        }


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
            .fillColor('#1B2631').text(reserva.dias, 345 - lengthDays, index - 4);

        let zeroPrice = parseFloat('0').toFixed(2);
        let constantLengthPrice = zeroPrice.toString().length * 5;
        doc.font('Times-Roman')
            .fontSize(10)
            .fillColor('#1B2631').text(zeroPrice + ' €', 440 - constantLengthPrice, index - 4);

        doc.font('Times-Roman')
            .fontSize(10)
            .fillColor('#1B2631').text(zeroPrice + ' €', 520 - constantLengthPrice, index - 4);

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

    let totalAmount = parseFloat(importeTotal).toFixed(2);
    let totalAmountLength = totalAmount.toString().length * 5;
    doc.font('Times-Bold')
        .fontSize(10)
        .fillColor('#1B2631').text(totalAmount + ' €', 520 - totalAmountLength, 470);

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#154360').text('Ajustes', 440, 480);

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text('0.00 €', 500, 480);

    let totalAmount20Px = parseFloat(importeTotal).toFixed(2);
    let totalAmount20PxLength = totalAmount20Px.toString().length * 10;
    doc.font('Times-Bold')
        .fontSize(20)
        .fillColor('green').text(totalAmount20Px + ' €', 515 - totalAmount20PxLength, 510);

    // Finalize PDF file
    doc.end();

}

module.exports = generarFactura;