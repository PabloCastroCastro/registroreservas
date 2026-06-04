import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCES = path.join(__dirname, 'sources');
const FONT_SCRIPT = path.join(SOURCES, 'Dancing_Script', 'static', 'DancingScript-Bold.ttf');
const FONT_SCRIPT_REG = path.join(SOURCES, 'Dancing_Script', 'static', 'DancingScript-Regular.ttf');
const FONT_SERIF = 'Times-Roman';
const FONT_SERIF_BOLD = 'Times-Bold';
const BG_IMAGE = path.join(SOURCES, 'fondo.png');

const CATEGORIES = ['Entrante', 'Principal', 'Postre', 'Bebida'];

// Page dimensions (A4)
const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 45;
const COL_W = (PAGE_W - MARGIN * 2 - 20) / 2;
const COL_LEFT = MARGIN;
const COL_RIGHT = MARGIN + COL_W + 20;

export function buildMenuPDF(dishes) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 0 });
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.registerFont('Script', FONT_SCRIPT);
        doc.registerFont('ScriptReg', FONT_SCRIPT_REG);

        // Background image — solo en franja superior e inferior como decoración
        try {
            doc.image(BG_IMAGE, 0, 0, { width: PAGE_W, height: 110 });
            doc.image(BG_IMAGE, 0, PAGE_H - 60, { width: PAGE_W, height: 60 });
        } catch (_) {}

        // Gradiente sobre franja superior para que el título sea legible
        doc.rect(0, 0, PAGE_W, 110).fillOpacity(0.6).fill('white').fillOpacity(1);

        // Fondo blanco limpio para el área de contenido
        doc.rect(0, 108, PAGE_W, PAGE_H - 168).fillOpacity(1).fill('white').fillOpacity(1);

        // Franja inferior con overlay
        doc.rect(0, PAGE_H - 60, PAGE_W, 60).fillOpacity(0.7).fill('white').fillOpacity(1);

        // Title
        doc.font('Script').fontSize(52).fillColor('#2c2c2c')
            .text('Carta de Cenas', 0, 30, { align: 'center', width: PAGE_W });

        // Decorative lines beside title
        const titleY = 55;
        doc.moveTo(MARGIN, titleY).lineTo(MARGIN + 60, titleY).lineWidth(1).strokeColor('#8492a6').stroke();
        doc.moveTo(PAGE_W - MARGIN - 60, titleY).lineTo(PAGE_W - MARGIN, titleY).lineWidth(1).strokeColor('#8492a6').stroke();

        // Casa de Miranda subtitle
        doc.font(FONT_SERIF).fontSize(9).fillColor('#273444')
            .text('CASA DE MIRANDA · Turismo Rural · Ézaro, A Coruña', 0, 88, { align: 'center', width: PAGE_W });

        doc.moveTo(MARGIN, 102).lineTo(PAGE_W - MARGIN, 102).lineWidth(0.5).strokeColor('#d3dce6').stroke();

        // Split categories into two columns
        const catDishes = CATEGORIES.map(cat => ({
            cat,
            dishes: dishes.filter(d => d.category === cat)
        })).filter(c => c.dishes.length > 0);

        // Distribute categories: left column gets first half, right gets second
        const mid = Math.ceil(catDishes.length / 2);
        const leftCats = catDishes.slice(0, mid);
        const rightCats = catDishes.slice(mid);

        let leftY = 115;
        let rightY = 115;

        const renderCategory = (cat, dishes, x, y) => {
            // Category header in script font
            doc.font('Script').fontSize(28).fillColor('#2c2c2c').text(cat, x, y, { width: COL_W });
            y += 36;

            for (const dish of dishes) {
                if (y > PAGE_H - 80) return y; // avoid overflow

                // Name + price on same line
                const priceStr = dish.price_half != null
                    ? `${Number(dish.price_full).toFixed(0)}€ / ${Number(dish.price_half).toFixed(0)}€ (½)`
                    : `${Number(dish.price_full).toFixed(0)}€`;

                const nameWidth = COL_W - 70;

                doc.font(FONT_SERIF).fontSize(10).fillColor('#1B2631')
                    .text(dish.name, x, y, { width: nameWidth, continued: false });

                doc.font(FONT_SERIF).fontSize(10).fillColor('#154360')
                    .text('| ' + priceStr, x + nameWidth, y, { width: 70, align: 'right' });

                y += 14;

                if (dish.description) {
                    doc.font('Times-Italic').fontSize(8.5).fillColor('#8492a6')
                        .text(dish.description, x, y, { width: COL_W });
                    y += 12;
                }

                const badges = [];
                if (dish.advance_notice) badges.push('Solicitar con antelación');
                if (dish.min_persons != null) badges.push(`Mín. ${dish.min_persons} pers.`);
                if (badges.length > 0) {
                    doc.font(FONT_SERIF).fontSize(8).fillColor('#ff7849')
                        .text(badges.join(' · '), x, y, { width: COL_W });
                    y += 11;
                }

                const allergens = dish.allergens ?? [];
                if (allergens.length > 0) {
                    doc.font(FONT_SERIF).fontSize(7.5).fillColor('#8492a6')
                        .text('Alérgenos: ' + allergens.join(', '), x, y, { width: COL_W });
                    y += 10;
                }

                y += 6;
            }

            return y;
        };

        for (const { cat, dishes } of leftCats) {
            leftY = renderCategory(cat, dishes, COL_LEFT, leftY);
            leftY += 10;
        }

        for (const { cat, dishes } of rightCats) {
            rightY = renderCategory(cat, dishes, COL_RIGHT, rightY);
            rightY += 10;
        }

        // Vertical divider
        const divTop = 115;
        const divBottom = Math.max(leftY, rightY) - 10;
        doc.moveTo(PAGE_W / 2, divTop).lineTo(PAGE_W / 2, divBottom)
            .lineWidth(0.5).strokeColor('#d3dce6').stroke();

        // Footer
        const footerY = PAGE_H - 45;
        doc.moveTo(MARGIN, footerY).lineTo(PAGE_W - MARGIN, footerY)
            .lineWidth(0.5).strokeColor('#d3dce6').stroke();
        doc.font(FONT_SERIF).fontSize(8).fillColor('#273444')
            .text('Los precios incluyen IVA · Consulte disponibilidad con antelación · casademiranda.com',
                0, footerY + 8, { align: 'center', width: PAGE_W });

        doc.end();
    });
}
