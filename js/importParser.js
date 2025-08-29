import { capitalizar, normalizar } from './utils.js';

/**
 * Parsea el contenido de texto de un archivo importado y lo convierte en una lista de productos.
 * @param {string} texto - El contenido de texto del archivo.
 * @param {object} state - El estado de la aplicación para buscar categorías y tiendas.
 * @returns {{productosParseados: Array, lineasConError: Array}} - Un objeto con los productos y los errores.
 */
export const parsearTextoImportado = (texto, state) => {
    const lineas = texto.split('\n');
    const productosParseados = [];
    const lineasConError = [];

    // Expresiones regulares para cada componente opcional
    const extractores = {
        notas: { regex: /\(Nota:\s*(.*?)\)/, procesador: match => match[1].trim() },
        prioridad: { regex: /\(Prioridad:\s*(alta|media|baja)\)/i, procesador: match => match[1].toLowerCase() },
        precio: { regex: /-\s*(\d+[,.]?\d*)\s*€/, procesador: match => parseFloat(match[1].replace(',', '.')) },
        tienda: { regex: /@\s*([^()@-]+)/, procesador: match => match[1].trim() },
        cantidad: { regex: /\((\d+[,.]?\d*)\s*(\w+)\)/, procesador: match => ({ cantidad: parseFloat(match[1].replace(',', '.')), unidad: match[2] || 'ud' }) }
    };

    lineas.forEach((linea, index) => {
        linea = linea.trim();
        if (!linea || linea.startsWith('=') || linea.startsWith('Lista de Compras')) return;

        try {
            if (!linea.startsWith('[') || !linea.includes(']')) {
                throw new Error("La línea debe empezar con [ ] o [x].");
            }

            const comprado = linea.substring(1, 2).toLowerCase() === 'x';
            let lineaRestante = linea.substring(linea.indexOf(']') + 1).trim();

            if (!lineaRestante) {
                throw new Error("No se encontró nombre de producto.");
            }

            const datosExtraidos = {
                prioridad: 'baja', // Valor por defecto
                cantidad: 1,
                unidad: 'ud',
                precioTotalCalculado: 0,
                notas: '',
                tiendaStr: ''
            };

            // Iterar sobre los extractores para encontrar y quitar los componentes
            for (const key in extractores) {
                const match = lineaRestante.match(extractores[key].regex);
                if (match) {
                    const resultado = extractores[key].procesador(match);
                    if (key === 'cantidad') {
                        datosExtraidos.cantidad = resultado.cantidad;
                        datosExtraidos.unidad = resultado.unidad;
                    } else if (key === 'tienda') {
                        datosExtraidos.tiendaStr = resultado;
                    } else if (key === 'precio') {
                        datosExtraidos.precioTotalCalculado = resultado;
                    } else {
                        datosExtraidos[key] = resultado;
                    }
                    lineaRestante = lineaRestante.replace(match[0], '').trim();
                }
            }

            const nombre = capitalizar(lineaRestante.trim());
            if (!nombre) {
                throw new Error("El nombre del producto no puede estar vacío.");
            }

            const categoriaNombre = state.productoCategoriaMapNormalizado[normalizar(nombre)];
            const categoria = Array.from(state.mapaCategorias.values()).find(c => c.nombre === categoriaNombre);
            const tienda = Array.from(state.mapaTiendas.values()).find(t => datosExtraidos.tiendaStr && normalizar(t.nombre) === normalizar(datosExtraidos.tiendaStr));

            productosParseados.push({
                nombre,
                cantidad: datosExtraidos.cantidad,
                unidad: datosExtraidos.unidad,
                precioTotalCalculado: datosExtraidos.precioTotalCalculado,
                categoriaId: categoria ? categoria.id : '',
                categoriaNombre: categoria ? categoria.nombre : 'Sin categoría',
                precioUnitario: (datosExtraidos.cantidad > 0 ? parseFloat((datosExtraidos.precioTotalCalculado / datosExtraidos.cantidad).toFixed(2)) : 0),
                tiendaId: tienda ? tienda.id : '',
                tiendaNombre: tienda ? tienda.nombre : 'Sin asignar',
                notas: datosExtraidos.notas,
                comprado,
                prioridad: datosExtraidos.prioridad,
                importado: true
            });

        } catch (error) {
            lineasConError.push({ num: index + 1, contenido: linea, error: error.message });
        }
    });

    return { productosParseados, lineasConError };
};