import PDFDocument from 'pdfkit';
import fs from 'fs';

function buildPDF(reserva, cliente) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header bar
        doc.lineCap('butt').moveTo(0, 0).lineTo(700, 0).lineWidth(10).fillAndStroke('green');

        doc.font('Times-Roman').fontSize(24).fillColor('green').text('Casa de Miranda', 75, 50);
        doc.font('Times-Bold').fontSize(12).fillColor('#154360').text('Número Factura: ' + reserva.numeroFactura, 375, 62);
        doc.fontSize(10).fillColor('grey').text('Lugar Ézaro', 75, 80);
        doc.fontSize(10).fillColor('grey').text('15297, A Coruña', 75, 91);
        doc.fontSize(10).fillColor('grey').text('(+34) 659134018', 75, 102);

        doc.font('Times-Bold').fontSize(20).fillColor('#154360').text('Reserva', 75, 150);
        doc.font('Times-Roman').fontSize(12).fillColor('green').text('Fecha: ' + reserva.fechaReserva, 75, 176);

        // Client header
        doc.font('Times-Bold').fontSize(12).fillColor('#1B2631').text('Nombre cliente:', 75, 210);
        doc.font('Times-Bold').fontSize(12).fillColor('#1B2631').text('Dni:', 250, 210);
        doc.font('Times-Bold').fontSize(12).fillColor('#1B2631').text('Check-in:', 350, 210);
        doc.font('Times-Bold').fontSize(12).fillColor('#1B2631').text('Check-out:', 450, 210);

        const clientName = cliente.nombre + ' ' + (cliente.apellido1 ?? cliente.apellidos ?? '') + (cliente.apellido2 ? ' ' + cliente.apellido2 : '');
        doc.font('Times-Roman').fontSize(12).fillColor('grey').text(clientName, 75, 224);
        doc.font('Times-Roman').fontSize(12).fillColor('grey').text(cliente.dni, 250, 224);
        doc.font('Times-Roman').fontSize(12).fillColor('grey').text(reserva.fechaCheckIn, 350, 224);
        doc.font('Times-Roman').fontSize(12).fillColor('grey').text(reserva.fechaCheckOut, 450, 224);

        // Address (optional)
        let tableStartY = 275;
        if (cliente.direccion) {
            doc.font('Times-Roman').fontSize(10).fillColor('grey').text(cliente.direccion, 75, 238);
            tableStartY = 290;
        }

        doc.lineCap('butt').moveTo(75, tableStartY).lineTo(525, tableStartY).lineWidth(1).fillAndStroke('grey');

        // Concepto (optional)
        const colLabelY = tableStartY + 15 + (reserva.concepto ? 15 : 0);
        if (reserva.concepto) {
            doc.font('Times-Italic').fontSize(10).fillColor('#154360').text(reserva.concepto, 75, tableStartY + 10);
        }

        doc.font('Times-Bold').fontSize(12).fillColor('#154360').text('Descripción', 75, colLabelY);
        doc.font('Times-Bold').fontSize(12).fillColor('#154360').text('Cantidad', 300, colLabelY);
        doc.font('Times-Bold').fontSize(12).fillColor('#154360').text('Precio unitario', 370, colLabelY);
        doc.font('Times-Bold').fontSize(12).fillColor('#154360').text('Precio total', 465, colLabelY);

        const rowsStartY = colLabelY + 20;
        let index = rowsStartY;
        let color = '#E5E8E8';
        let importeTotal = 0;

        // Room rows
        for (let i = 0; i < reserva.habitaciones.length; i++) {
            doc.lineCap('butt').moveTo(75, index).lineTo(525, index).lineWidth(15).fillOpacity(0.8).fillAndStroke(color);
            doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text('Habitación Doble (' + reserva.habitaciones[i].habitacion + ')', 76, index - 4);

            const lengthDays = reserva.dias.toString().length * 5;
            doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text(reserva.dias, 345 - lengthDays, index - 4);

            const price = parseFloat(reserva.habitaciones[i].precio).toFixed(2);
            doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text(price + ' €', 440 - price.length * 5, index - 4);

            const totalRoomPrice = (reserva.dias * reserva.habitaciones[i].precio).toFixed(2);
            doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text(totalRoomPrice + ' €', 520 - totalRoomPrice.length * 5, index - 4);

            importeTotal += reserva.dias * reserva.habitaciones[i].precio;
            color = color === '#E5E8E8' ? 'white' : '#E5E8E8';
            index += 15;

            // Supletorias
            if (reserva.habitaciones[i].supletorias != null && reserva.habitaciones[i].supletorias > 0) {
                doc.lineCap('butt').moveTo(75, index).lineTo(525, index).lineWidth(15).fillOpacity(0.8).fillAndStroke(color);
                doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text('Supletoria', 76, index - 4);
                doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text(reserva.dias, 345 - lengthDays, index - 4);

                const extraBedPrice = parseFloat(reserva.habitaciones[i].precioSupletoria).toFixed(2);
                doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text(extraBedPrice + ' €', 440 - extraBedPrice.length * 5, index - 4);

                const totalExtraBedPrice = (reserva.dias * reserva.habitaciones[i].supletorias * reserva.habitaciones[i].precioSupletoria).toFixed(2);
                doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text(totalExtraBedPrice + ' €', 520 - totalExtraBedPrice.length * 5, index - 4);

                importeTotal += reserva.dias * reserva.habitaciones[i].supletorias * reserva.habitaciones[i].precioSupletoria;
                color = color === '#E5E8E8' ? 'white' : '#E5E8E8';
                index += 15;
            }

            // Desayuno
            doc.lineCap('butt').moveTo(75, index).lineTo(525, index).lineWidth(15).fillOpacity(0.8).fillAndStroke(color);
            doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text('Desayuno incluido', 76, index - 4);
            doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text(reserva.dias, 345 - lengthDays, index - 4);
            doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text('0.00 €', 415, index - 4);
            doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text('0.00 €', 495, index - 4);

            color = color === '#E5E8E8' ? 'white' : '#E5E8E8';
            index += 15;
        }

        // Extra rows
        if (reserva.extras && reserva.extras.length > 0) {
            for (const extra of reserva.extras) {
                doc.lineCap('butt').moveTo(75, index).lineTo(525, index).lineWidth(15).fillOpacity(0.8).fillAndStroke(color);
                doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text(extra.descripcion, 76, index - 4);
                doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text('1', 340, index - 4);

                const extraPrice = parseFloat(extra.precio).toFixed(2);
                doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text(extraPrice + ' €', 440 - extraPrice.length * 5, index - 4);
                doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text(extraPrice + ' €', 520 - extraPrice.length * 5, index - 4);

                importeTotal += parseFloat(extra.precio);
                color = color === '#E5E8E8' ? 'white' : '#E5E8E8';
                index += 15;
            }
        }

        // Fill rows to footer
        const fillTarget = Math.max(index, rowsStartY + 135);
        while (index < fillTarget) {
            doc.lineCap('butt').moveTo(75, index).lineTo(525, index).lineWidth(15).fillOpacity(0.8).fillAndStroke(color);
            color = color === '#E5E8E8' ? 'white' : '#E5E8E8';
            index += 15;
        }

        doc.lineCap('butt').moveTo(75, index).lineTo(525, index).lineWidth(15).fillOpacity(0.8).fillAndStroke(color);
        doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text('El precio incluye', 76, index - 4);
        doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text('10% IVA €', 480, index - 4);
        doc.lineCap('butt').moveTo(75, index + 6).lineTo(525, index + 6).lineWidth(1).fillAndStroke('grey');

        const summaryY = index + 15;
        const totalAmount = parseFloat(importeTotal).toFixed(2);
        doc.font('Times-Roman').fontSize(10).fillColor('#154360').text('Subtotal', 440, summaryY);
        doc.font('Times-Bold').fontSize(10).fillColor('#1B2631').text(totalAmount + ' €', 520 - totalAmount.length * 5, summaryY);
        doc.font('Times-Roman').fontSize(10).fillColor('#154360').text('Ajustes', 440, summaryY + 10);
        doc.font('Times-Roman').fontSize(10).fillColor('#1B2631').text('0.00 €', 500, summaryY + 10);
        doc.font('Times-Bold').fontSize(20).fillColor('green').text(totalAmount + ' €', 515 - totalAmount.length * 10, summaryY + 25);

        doc.end();
    });
}

export async function generarFactura(reserva, cliente) {
    const buffer = await buildPDF(reserva, cliente);
    fs.writeFileSync('./facturas-cliente/' + reserva.numeroFactura + '.pdf', buffer);
}

export async function previewFactura(reserva, cliente) {
    return buildPDF(reserva, cliente);
}
