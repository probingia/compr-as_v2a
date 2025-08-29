import { mostrarNotificacion } from './notifications.js';
import { agruparPorCategoria } from './utils.js';

/**
 * Genera un documento PDF a partir de una lista de productos.
 * @param {Array} productos - La lista de productos a exportar.
 * @param {object} state - El estado de la aplicación (para acceder a categorías y tiendas).
 */
export const generarPdfLista = (productos, state) => {
    mostrarNotificacion('Generando PDF, por favor espere...', 'info');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // --- Configuración del Documento ---
    const margin = 15;
    const lineHeight = 6;
    const pageHeight = doc.internal.pageSize.getHeight();
    const columnWidth = (doc.internal.pageSize.getWidth() - (margin * 2));
    const priorityColors = { alta: '#dc3545', media: '#ffc107', baja: '#198754' };

    // --- Cálculos y Ordenación ---
    const costeTotal = productos.reduce((total, p) => total + (p.precioTotalCalculado || 0), 0);
    const productosAgrupados = agruparPorCategoria(productos);

    for (const catId in productosAgrupados) {
        productosAgrupados[catId].sort((a, b) => {
            if (a.comprado !== b.comprado) return a.comprado ? 1 : -1;
            return a.nombre.localeCompare(b.nombre);
        });
    }

    const sortedCategoryIds = Object.keys(productosAgrupados).sort((a, b) => {
        const catA = state.mapaCategorias.get(a)?.nombre || 'z';
        const catB = state.mapaCategorias.get(b)?.nombre || 'z';
        return catA.localeCompare(catB);
    });

    // --- Dibujado del PDF ---
    let y = margin + lineHeight;
    doc.setFontSize(16);
    doc.text(`Lista de Compras | Total: ${costeTotal.toFixed(2)}€`, margin, y);
    y += lineHeight * 2;
    doc.setFontSize(10);

    sortedCategoryIds.forEach(catId => {
        const categoria = state.mapaCategorias.get(catId) || { nombre: 'Sin Categoría' };
        const productsInCat = productosAgrupados[catId];

        if (y + lineHeight * 2 > pageHeight - margin) {
            doc.addPage();
            y = margin + lineHeight;
        }

        doc.setFont(undefined, 'bold');
        doc.text(categoria.nombre, margin, y);
        doc.setFont(undefined, 'normal');
        y += lineHeight * 1.5;

        productsInCat.forEach(p => {
            const textX = margin + 5;
            
            const lines = [];
            const tienda = state.mapaTiendas.get(p.tiendaId);
            const precioTexto = p.precioTotalCalculado ? `${p.precioTotalCalculado.toFixed(2)}€` : 'N/A';

            lines.push(`${p.nombre} (${p.cantidad} ${p.unidad}) | Precio: ${precioTexto}`);
            
            const tiendaTexto = tienda ? tienda.nombre : '';
            lines.push(`Tienda: ${tiendaTexto}`);

            const notaTexto = p.notas || '';
            lines.push(`Nota: ${notaTexto}`);

            const textoProducto = lines.join('\n \n'); // Añadir espacio entre líneas
            const splitText = doc.splitTextToSize(textoProducto, columnWidth - 8);
            const textHeight = splitText.length * lineHeight;

            if (y + textHeight > pageHeight - margin) {
                doc.addPage();
                y = margin + lineHeight;
            }

            if (!p.comprado && p.prioridad) {
                const lineX = margin + 1.5;
                const lineTopY = y - (lineHeight * 0.8);
                const lineBottomY = lineTopY + textHeight - lineHeight;
                doc.setDrawColor(priorityColors[p.prioridad] || '#cccccc');
                doc.setLineWidth(1);
                doc.line(lineX, lineTopY, lineX, lineBottomY);
            }

            if (p.comprado) {
                doc.setTextColor('#6c757d');
                doc.text(splitText, textX, y, { flags: { 'strikeout': true } });
                doc.setTextColor('#000000');
            } else {
                doc.text(splitText, textX, y);
            }

            y += textHeight + (lineHeight / 2);
        });
    });

    doc.save('lista-compras.pdf');
};
