import { state } from './state.js';
import { normalizar, calcularPrecioTotalProducto } from './utils.js';
import { saveState, loadState, initDB } from './db.js';
import { mostrarNotificacion } from './notifications.js';

/**
 * Loads the application state from IndexedDB.
 * @returns {Promise<void>}
 */
export const cargarEstado = async () => {
    await initDB(); // Asegurarse de que la BD está inicializada
    const loaded = await loadState();
    
    state.productos = loaded.productos || [];
    if (loaded.categorias) {
        loaded.categorias.forEach(cat => state.mapaCategorias.set(cat.id, cat));
    }
    if (loaded.tiendas) {
        loaded.tiendas.forEach(tienda => state.mapaTiendas.set(tienda.id, tienda));
    }
    state.listaAutocompletado = loaded.listaAutocompletado || [];
    state.productoCategoriaMap = loaded.productoCategoriaMap || {};

    // Reconstruir el mapa normalizado a partir del mapa cargado
    state.productoCategoriaMapNormalizado = Object.keys(state.productoCategoriaMap).reduce((acc, key) => {
        acc[normalizar(key)] = state.productoCategoriaMap[key];
        return acc;
    }, {});
};

/**
 * Loads initial data from JSON files or creates a demo list if the database is empty.
 */
export const cargarDatosIniciales = async () => {
    console.log('cargando datos iniciales');
    try {
        const productosResponse = await fetch('productos.json');
        if (!productosResponse.ok) throw new Error(`HTTP error! status: ${productosResponse.status}`);
        const productosData = await productosResponse.json();

        if (productosData && productosData.productoCategoriaMap && productosData.listaAutocompletado) {
            state.productoCategoriaMap = productosData.productoCategoriaMap;
            state.productoCategoriaMapNormalizado = Object.keys(state.productoCategoriaMap).reduce((acc, key) => {
                acc[normalizar(key)] = state.productoCategoriaMap[key];
                return acc;
            }, {});

            state.listaAutocompletado = [...new Set([...state.listaAutocompletado, ...productosData.listaAutocompletado])].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

            const categorias = [...new Set(Object.values(state.productoCategoriaMap))];
            let nextId = 1;
            for (const cat of categorias) {
                if (![...state.mapaCategorias.values()].some(c => c.nombre === cat)) {
                    state.mapaCategorias.set(nextId.toString(), { id: nextId.toString(), nombre: cat });
                    nextId++;
                }
            }

        } else {
            console.warn('ADVERTENCIA: "productos.json" no contiene un formato válido.');
        }

        if (state.mapaCategorias.size === 0) {
             if (productosData && Array.isArray(productosData.categorias)) {
                 productosData.categorias.forEach(cat => state.mapaCategorias.set(cat.id, cat));
             }
        }

        if (state.mapaTiendas.size === 0) {
            const tiendasResponse = await fetch('tiendas.json');
            if (!tiendasResponse.ok) throw new Error(`HTTP error! status: ${tiendasResponse.status}`);
            const tiendasData = await tiendasResponse.json();
            if(Array.isArray(tiendasData)){
                tiendasData.forEach(tienda => state.mapaTiendas.set(tienda.id, tienda));
            }
        }

        if (state.productos.length === 0) {
            addDemoProducts();
        }

    } catch (error) {
        console.error("Error fatal al cargar datos iniciales:", error);
        mostrarNotificacion("No se pudieron cargar los datos iniciales. La aplicación podría no funcionar correctamente.", 'error');
        throw error;
    }
};

/**
 * Creates and adds a list of demo products to the state.
 * This is intended for first-time users.
 */
const addDemoProducts = () => {
    const demoProductsData = [
        { nombre: "Aceite", cantidadStr: "1 Uds", precioStr: "2.00€", prioridad: "baja", tienda: "Mercadona", notas: "Mi marca de siempre.", comprado: false, categoria: null },
        { nombre: "Aceite de oliva", cantidadStr: "1 Uds", precioStr: "4.45€", prioridad: "media", tienda: "Mercadona", notas: "Oferta.", comprado: false, categoria: null },
        { nombre: "Leche entera", cantidadStr: "6 l", precioStr: "Sin precio", prioridad: "alta", tienda: "Carrefour", notas: "Mirar precios.", comprado: false, categoria: null },
        { nombre: "Manzana", cantidadStr: "3,5 kg", precioStr: "3.29 €", prioridad: "alta", tienda: "Lidl", notas: "¿Reineta?.", comprado: true, categoria: null },
        { nombre: "Paracetamol", cantidadStr: "2 Uds", precioStr: "Sin precio", prioridad: "baja", tienda: "Farmacia", notas: "", comprado: false, categoria: "Sin Categoría" }
    ];

    const baseId = Date.now(); // Base timestamp for unique IDs

    const parseDemoProduct = (data, index) => {
        const [cant, unit] = data.cantidadStr.split(' ');
        const cantidad = parseFloat(cant.replace(',', '.'));
        const unidad = unit.toLowerCase().startsWith('uds') ? 'ud' : unit.toLowerCase();

        const precioUnitario = data.precioStr.toLowerCase() === 'sin precio' ? 0 : parseFloat(data.precioStr.replace('€', '').trim());

        let tienda = Array.from(state.mapaTiendas.values()).find(t => normalizar(t.nombre) === normalizar(data.tienda));
        if (!tienda) {
            const nuevaTienda = { id: (baseId + 1000 + index).toString(), nombre: data.tienda };
            state.mapaTiendas.set(nuevaTienda.id, nuevaTienda);
            tienda = nuevaTienda;
        }

        let categoriaId = '';
        if (data.categoria !== "Sin Categoría") {
            const categoriaNombre = state.productoCategoriaMapNormalizado[normalizar(data.nombre)];
            const categoria = Array.from(state.mapaCategorias.values()).find(c => c.nombre === categoriaNombre);
            if (categoria) {
                categoriaId = categoria.id;
            }
        }
        
        const producto = {
            id: (baseId + index).toString(), // Use baseId and index for unique string ID
            nombre: data.nombre,
            cantidad: cantidad,
            unidad: unidad,
            precioUnitario: precioUnitario,
            categoriaId: categoriaId,
            tiendaId: tienda.id,
            notas: data.notas,
            comprado: data.comprado,
            prioridad: data.prioridad,
            importado: false
        };
        
        producto.precioTotalCalculado = calcularPrecioTotalProducto(producto.cantidad, producto.unidad, producto.precioUnitario);
        return producto;
    };

    state.productos = demoProductsData.map(parseDemoProduct);
    
    demoProductsData.forEach(p => {
        if (!state.listaAutocompletado.some(item => normalizar(item) === normalizar(p.nombre))) {
            state.listaAutocompletado.push(p.nombre);
        }
    });
    state.listaAutocompletado.sort();
};