const PDFDocument = require('pdfkit');
const fs = require('fs');

const generarFactura = (reserva, cliente) => {


    // Create a document
    const doc = new PDFDocument();

    // Pipe its output somewhere, like to a file or HTTP response
    doc.pipe(fs.createWriteStream(reserva.numeroFactura + '.pdf'));

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

    doc.lineCap('butt')
        .moveTo(75, 320)
        .lineTo(525, 320)
        .lineWidth(15)
        .fillOpacity(0.8)
        .fillAndStroke('#E5E8E8');

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text('Habitación Doble ('+reserva.habitacion+')', 76, 316);

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text(reserva.dias, 342, 316);

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text(reserva.precio + ' €', 422, 316);    

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text(reserva.dias*reserva.precio + ' €', 507, 316);    

    doc.lineCap('butt')
        .moveTo(75, 335)
        .lineTo(525, 335)
        .lineWidth(15)
        .fillOpacity(0.8)
        .fillAndStroke('white');

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text('Desayuno incluido', 76, 331);

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text(reserva.dias, 342, 331);

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text('0,00 €', 415, 331);    

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text('0,00 €', 500, 331);    


    doc.lineCap('butt')
        .moveTo(75, 350)
        .lineTo(525, 350)
        .lineWidth(15)
        .fillOpacity(0.8)
        .fillAndStroke('#E5E8E8');

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text('Habitación Doble (O Cuberto)', 76, 346);

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text('2', 342, 346);

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text('220 €', 417, 346);    

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text('220 €', 502, 346);   

    doc.lineCap('butt')
        .moveTo(75, 365)
        .lineTo(525, 365)
        .lineWidth(15)
        .fillOpacity(0.8)
        .fillAndStroke('white');

    doc.lineCap('butt')
        .moveTo(75, 380)
        .lineTo(525, 380)
        .lineWidth(15)
        .fillOpacity(0.8)
        .fillAndStroke('#E5E8E8');

    doc.lineCap('butt')
        .moveTo(75, 395)
        .lineTo(525, 395)
        .lineWidth(15)
        .fillOpacity(0.8)
        .fillAndStroke('white');

    doc.lineCap('butt')
        .moveTo(75, 410)
        .lineTo(525, 410)
        .lineWidth(15)
        .fillOpacity(0.8)
        .fillAndStroke('#E5E8E8');

    doc.lineCap('butt')
        .moveTo(75, 425)
        .lineTo(525, 425)
        .lineWidth(15)
        .fillOpacity(0.8)
        .fillAndStroke('white');

    doc.lineCap('butt')
        .moveTo(75, 440)
        .lineTo(525, 440)
        .lineWidth(15)
        .fillOpacity(0.8)
        .fillAndStroke('#E5E8E8');

    doc.lineCap('butt')
        .moveTo(75, 455)
        .lineTo(525, 455)
        .lineWidth(15)
        .fillOpacity(0.8)
        .fillAndStroke('white');

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
        .fillColor('#1B2631').text('90,00 €', 495, 470);   

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#154360').text('Ajustes', 440, 490);

    doc.font('Times-Roman')
        .fontSize(10)
        .fillColor('#1B2631').text('0,00 €', 500, 490);   

    doc.font('Times-Bold')
        .fontSize(20)
        .fillColor('green').text('90,00 €', 465, 510);  

    // Finalize PDF file
    doc.end();

}

module.exports = generarFactura;