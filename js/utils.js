export const capitalizar = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
export const normalizar = (str) => str ? str.toLowerCase().trim() : '';

export const agruparPorCategoria = (listaDeProductos) => {
    return listaDeProductos.reduce((acc, producto) => {
        const categoriaId = producto.categoriaId || '0'; // '0' para 'Sin Categoría'
        if (!acc[categoriaId]) acc[categoriaId] = [];
        acc[categoriaId].push(producto);
        return acc;
    }, {});
};

export const calcularPrecioTotalProducto = (cantidad, unidad, precioUnitario) => {
    // Si no hay precio unitario o la cantidad es explícitamente 0, el total es 0.
    if (!precioUnitario || cantidad === 0) return 0;
    // Si la cantidad es nula/indefinida (no se ha introducido), se devuelve el precio unitario base.
    if (!cantidad) return precioUnitario;

    let totalCalculado = 0;
    switch (unidad) {
        case 'g':
            totalCalculado = (cantidad / 1000) * precioUnitario;
            break;
        case 'kg':
        case 'l':
        case 'ud':
        default:
            totalCalculado = cantidad * precioUnitario;
            break;
    }
    
    // Redondear a 2 decimales para evitar problemas de punto flotante con la moneda.
    // Math.round(num * 100) / 100 es una forma robusta de hacerlo.
    return Math.round(totalCalculado * 100) / 100;
};

export const getProductosFiltrados = (state, dom) => {
    const { productos, compradosOcultos } = state;
    const tiendaFiltradaId = dom.filtroTiendaSelect.value;
    const prioridadFiltrada = dom.filtroPrioridadSelect.value;
    const textoBusqueda = normalizar(dom.busquedaInput.value);

    return productos.filter(p => {
        const filtroTiendaOk = tiendaFiltradaId === 'all' || p.tiendaId == tiendaFiltradaId;
        const filtroPrioridadOk = prioridadFiltrada === 'all' || p.prioridad === prioridadFiltrada;
        const filtroBusquedaOk = textoBusqueda === '' || normalizar(p.nombre).includes(textoBusqueda) || (p.notas && normalizar(p.notas).includes(textoBusqueda));
        const filtroCompradosOk = !compradosOcultos || !p.comprado;

        return filtroTiendaOk && filtroPrioridadOk && filtroBusquedaOk && filtroCompradosOk;
    });
};

export const validarProducto = (nombre, cantidadStr, precioStr) => {
    const nombreTrimmed = nombre.trim();
    if (!nombreTrimmed) {
        return { error: 'El nombre del producto es obligatorio.' };
    }

    let cantidad;
    if (cantidadStr === '') {
        cantidad = 1;
    } else {
        cantidad = parseFloat(cantidadStr);
        if (isNaN(cantidad) || cantidad <= 0) {
            return { error: 'La cantidad debe ser un número positivo.' };
        }
    }

    let precio;
    if (precioStr === '') {
        precio = 0;
    } else {
        precio = parseFloat(precioStr.replace(',', '.'));
        if (isNaN(precio) || precio < 0) {
            return { error: 'El precio debe ser un número válido y no negativo.' };
        }
    }

    return { nombre: capitalizar(nombreTrimmed), cantidad, precio };
};