import { normalizar, calcularPrecioTotalProducto, capitalizar } from './utils.js';

export const state = {
    productos: [],
    mapaCategorias: new Map(),
    mapaTiendas: new Map(),
    listaAutocompletado: [],
    productoCategoriaMap: {},
    productoCategoriaMapNormalizado: {}, // Para búsquedas case-insensitive
    modoOrden: 'categoria', // 'categoria', 'alfa', 'prioridad', 'coste'
    costeOrden: 'asc', // 'asc', 'desc'
    compradosOcultos: false,
    fontSizes: ['font-size-normal', 'font-size-large', 'font-size-xlarge'],
    prioridadMap: { 'alta': 3, 'media': 2, 'baja': 1 }
};

// --- GETTERS ---

export const getCategories = () => Array.from(state.mapaCategorias.values());
export const getStores = () => Array.from(state.mapaTiendas.values());

// --- CATEGORY MANAGEMENT ---



const editItem = (map, id, newName, itemNameSingular) => {
    const item = map.get(id);
    if (!item) {
        return { success: false, changed: false, message: `La ${itemNameSingular} no existe.` };
    }
    
    const nombreTrimmed = newName.trim();
    if (!nombreTrimmed) {
        return { success: false, changed: false, message: 'El nombre no puede estar vacío.' };
    }

    if (item.nombre === nombreTrimmed) {
        return { success: true, changed: false, message: 'No se han detectado cambios.' };
    }

    const nombreNormalizado = normalizar(nombreTrimmed);
    if (Array.from(map.values()).some(i => i.nombre && normalizar(i.nombre) === nombreNormalizado && i.id !== id)) {
        return { success: false, changed: false, message: `La ${itemNameSingular} "${nombreTrimmed}" ya existe.` };
    }

    item.nombre = nombreTrimmed;
    const sortedArray = [...map.entries()].sort((a, b) => a[1].nombre.localeCompare(b[1].nombre, 'es', { sensitivity: 'base' }));
    map.clear();
    for (const [id, item] of sortedArray) {
        map.set(id, item);
    }
    return { success: true, changed: true, message: `${capitalizar(itemNameSingular)} actualizada.` };
};

export const editCategory = (id, nuevoNombre) => editItem(state.mapaCategorias, id, nuevoNombre, 'categoría');

const deleteItem = (map, id, itemNameSingular, propertyName) => {
    if (!map.has(id)) {
        return { success: false, message: `No se encontró la ${itemNameSingular} para eliminar.` };
    }

    map.delete(id);

    state.productos = state.productos.map(p => {
        if (p[propertyName] === id) {
            return { ...p, [propertyName]: '' };
        }
        return p;
    });

    return { success: true, message: `${capitalizar(itemNameSingular)} eliminada.` };
};

export const deleteCategory = (id) => deleteItem(state.mapaCategorias, id, 'categoría', 'categoriaId');

// --- STORE MANAGEMENT ---

const addItem = (map, itemName, itemNameSingular) => {
    const nombreTrimmed = itemName.trim();
    if (!nombreTrimmed) {
        return { success: false, message: `El nombre de la ${itemNameSingular} no puede estar vacío.` };
    }
    const nombreNormalizado = normalizar(nombreTrimmed);
    if (Array.from(map.values()).some(item => normalizar(item.nombre) === nombreNormalizado)) {
        return { success: false, message: `La ${itemNameSingular} "${nombreTrimmed}" ya existe.` };
    }

    const newItem = {
        id: Date.now().toString(),
        nombre: nombreTrimmed
    };
    map.set(newItem.id, newItem);
    const sortedArray = [...map.entries()].sort((a, b) => a[1].nombre.localeCompare(b[1].nombre, 'es', { sensitivity: 'base' }));
    map.clear();
    for (const [id, item] of sortedArray) {
        map.set(id, item);
    }
    return { success: true, data: newItem, message: `${capitalizar(itemNameSingular)} "${nombreTrimmed}" añadida.` };
};

export const addCategory = (nombre) => addItem(state.mapaCategorias, nombre, 'categoría');
export const addStore = (nombre) => addItem(state.mapaTiendas, nombre, 'tienda');

export const editStore = (id, nuevoNombre) => editItem(state.mapaTiendas, id, nuevoNombre, 'tienda');

export const deleteStore = (id) => deleteItem(state.mapaTiendas, id, 'tienda', 'tiendaId');

// --- PRODUCT MANAGEMENT ---

export const addProduct = (productData) => {
    if (!productData.nombre) {
        return { success: false, message: 'El nombre del producto es obligatorio.' };
    }

    const nuevoProducto = {
        id: Date.now().toString(),
        ...productData,
        comprado: false,
        importado: false
    };
    nuevoProducto.precioTotalCalculado = calcularPrecioTotalProducto(nuevoProducto.cantidad, nuevoProducto.unidad, nuevoProducto.precioUnitario);

    state.productos.push(nuevoProducto);

    const nombreNormalizado = normalizar(nuevoProducto.nombre);

    // Si el producto tiene una categoría y no está ya en el mapa, lo "aprendemos"
    if (productData.categoriaId && !state.productoCategoriaMapNormalizado[nombreNormalizado]) {
        const categoria = state.mapaCategorias.get(productData.categoriaId);
        if (categoria) {
            const nombreProducto = nuevoProducto.nombre;
            // Actualizamos ambos mapas, el normal y el normalizado para búsquedas
            state.productoCategoriaMap[nombreProducto] = categoria.nombre;
            state.productoCategoriaMapNormalizado[nombreNormalizado] = categoria.nombre;
        }
    }

    if (!state.listaAutocompletado.some(item => normalizar(item) === nombreNormalizado)) {
        state.listaAutocompletado.push(nuevoProducto.nombre);
        state.listaAutocompletado.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
    }
    
    return { success: true, data: nuevoProducto, message: `${nuevoProducto.nombre} añadido a la lista.` };
};

export const updateProduct = (id, productData) => {
    const producto = state.productos.find(p => p.id === id);
    if (!producto) {
        return { success: false, message: 'Producto no encontrado.' };
    }
    if (!productData.nombre) {
        return { success: false, message: 'El nombre del producto es obligatorio.' };
    }

    Object.assign(producto, productData);
    producto.precioTotalCalculado = calcularPrecioTotalProducto(producto.cantidad, producto.unidad, producto.precioUnitario);
    
    return { success: true, data: producto, message: `Producto "${producto.nombre}" actualizado.` };
};

export const deleteProduct = (id) => {
    const initialLength = state.productos.length;
    state.productos = state.productos.filter(p => p.id !== id);
    
    if (state.productos.length === initialLength) {
        return { success: false, message: 'No se encontró el producto para eliminar.' };
    }
    return { success: true, message: 'Producto eliminado.' };
};

export const toggleProductStatus = (id) => {
    const producto = state.productos.find(p => p.id === id);
    if (!producto) {
        return { success: false, message: 'Producto no encontrado.' };
    }
    producto.comprado = !producto.comprado;
    return { success: true, data: { comprado: producto.comprado } };
};

// --- AUTOCOMPLETE MANAGEMENT ---

export const removeFromAutocomplete = (productName) => {
    const normalizedProductName = normalizar(productName);
    const initialLength = state.listaAutocompletado.length;
    state.listaAutocompletado = state.listaAutocompletado.filter(item => normalizar(item) !== normalizedProductName);

    if (state.listaAutocompletado.length < initialLength) {
        return { success: true, message: `"${productName}" eliminado del autocompletado.` };
    } else {
        return { success: false, message: `No se encontró "${productName}" en la lista.` };
    }
};

export const editAutocompleteItem = (oldName, newName) => {
    const oldNameNormalized = normalizar(oldName);
    const newNameNormalized = normalizar(newName);

    if (!newName.trim()) {
        return { success: false, message: 'El nombre no puede estar vacío.' };
    }

    // Verificar si el nuevo nombre ya existe (y no es el mismo que el antiguo)
    if (oldNameNormalized !== newNameNormalized && state.listaAutocompletado.some(item => normalizar(item) === newNameNormalized)) {
        return { success: false, message: `El producto "${newName}" ya existe en el autocompletado.` };
    }

    const itemIndex = state.listaAutocompletado.findIndex(item => normalizar(item) === oldNameNormalized);

    if (itemIndex === -1) {
        return { success: false, message: `No se encontró el producto "${oldName}" para editar.` };
    }

    // Actualizar la lista de autocompletado
    state.listaAutocompletado[itemIndex] = newName;
    state.listaAutocompletado.sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));

    // Actualizar el mapa de categorías
    const categoria = state.productoCategoriaMapNormalizado[oldNameNormalized];
    if (categoria) {
        // Eliminar la entrada antigua de ambos mapas
        const oldNameOriginal = Object.keys(state.productoCategoriaMap).find(key => normalizar(key) === oldNameNormalized);
        if (oldNameOriginal) {
            delete state.productoCategoriaMap[oldNameOriginal];
        }
        delete state.productoCategoriaMapNormalizado[oldNameNormalized];

        // Añadir la nueva entrada
        state.productoCategoriaMap[newName] = categoria;
        state.productoCategoriaMapNormalizado[newNameNormalized] = categoria;
    }

    return { success: true, message: 'Producto actualizado en el autocompletado.' };
};