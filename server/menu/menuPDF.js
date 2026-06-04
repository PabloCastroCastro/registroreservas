import PDFDocument from 'pdfkit';

const CATEGORIES = ['Entrante', 'Principal', 'Postre', 'Bebida'];

export function buildMenuPDF(dishes) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header bar
        doc.lineCap('butt').moveTo(0, 0).lineTo(700, 0).lineWidth(10).fillAndStroke('green');

        // Title
        doc.font('Times-Roman').fontSize(28).fillColor('green').text('Casa de Miranda', 50, 40);
        doc.font('Times-Bold').fontSize(16).fillColor('#154360').text('Carta de Cenas', 50, 76);

        doc.font('Times-Roman').fontSize(10).fillColor('grey')
            .text('Lugar Ézaro · 15297, A Coruña · (+34) 659134018', 50, 96);

        doc.moveTo(50, 115).lineTo(545, 115).lineWidth(1).strokeColor('#d3dce6').stroke();

        let y = 130;

        for (const cat of CATEGORIES) {
            const catDishes = dishes.filter(d => d.category === cat);
            if (catDishes.length === 0) continue;

            // Category header
            y += 10;
            doc.font('Times-Bold').fontSize(13).fillColor('#154360').text(cat.toUpperCase(), 50, y);
            y += 18;
            doc.moveTo(50, y).lineTo(545, y).lineWidth(0.5).strokeColor('#d3dce6').stroke();
            y += 10;

            for (const dish of catDishes) {
                // Check if we need a new page
                if (y > 720) {
                    doc.addPage();
                    y = 50;
                }

                // Dish name + prices on same line
                doc.font('Times-Bold').fontSize(11).fillColor('#1B2631').text(dish.name, 50, y, { continued: false, width: 350 });

                const priceText = dish.price_half != null
                    ? `${Number(dish.price_full).toFixed(2)} € / ${Number(dish.price_half).toFixed(2)} € (½)`
                    : `${Number(dish.price_full).toFixed(2)} €`;
                doc.font('Times-Roman').fontSize(11).fillColor('#154360').text(priceText, 400, y, { width: 145, align: 'right' });

                y += 14;

                // Description
                if (dish.description) {
                    doc.font('Times-Italic').fontSize(10).fillColor('grey').text(dish.description, 50, y, { width: 495 });
                    y += 13;
                }

                // Observations
                if (dish.observations) {
                    doc.font('Times-Roman').fontSize(9).fillColor('grey').text(dish.observations, 50, y, { width: 495 });
                    y += 12;
                }

                // Badges
                const badges = [];
                if (dish.advance_notice) badges.push('Solicitar con antelación');
                if (dish.min_persons != null) badges.push(`Mín. ${dish.min_persons} personas`);
                if (badges.length > 0) {
                    doc.font('Times-Roman').fontSize(9).fillColor('#ff7849').text(badges.join(' · '), 50, y, { width: 495 });
                    y += 12;
                }

                y += 8;
            }
        }

        // Footer
        doc.font('Times-Roman').fontSize(9).fillColor('grey')
            .text('Los precios incluyen IVA. Consulte disponibilidad con antelación.', 50, y + 10, { align: 'center', width: 495 });

        doc.end();
    });
}
