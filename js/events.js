import { state, getCategories, getStores, addCategory, editCategory, deleteCategory, addStore, editStore, deleteStore, addProduct, updateProduct, deleteProduct, toggleProductStatus, removeFromAutocomplete, editAutocompleteItem } from './state.js';
import { dom } from './dom.js';
import { capitalizar, normalizar, getProductosFiltrados, validarProducto } from './utils.js';
import { render, renderSugerencias, renderSelect, renderProductos, renderGestion, actualizarLabelPrecio, renderImportPreview, renderImportResult, renderExportSelection, renderTotales } from './render.js';
import { generarPdfLista } from './pdfGenerator.js';
import { mostrarNotificacion } from './notifications.js';
import { mostrarConfirmacion } from './confirm.js';
import { parsearTextoImportado } from './importParser.js';

let productosAImportar = [];

const abrirModalEdicion = (producto) => {
    const getPrecioLabel = (unidad) => {
        if (unidad === 'kg' || unidad === 'g') return '€ / kg';
        if (unidad === 'l') return '€ / l';
        return '€ / ud';
    };
    const precioLabel = getPrecioLabel(producto.unidad);
    const idPrefix = `edit-${producto.id}-`;

    dom.editModalBody.innerHTML = `
        <input type="hidden" id="edit-producto-id" value="${producto.id}">
        <div class="mb-3">
            <label for="${idPrefix}nombre-producto" class="form-label">Nombre</label>
            <input type="text" id="${idPrefix}nombre-producto" class="form-control" value="${producto.nombre}">
        </div>
        <div class="row g-3 mb-3">
            <div class="col-md-6">
                <label for="${idPrefix}cantidad-producto" class="form-label">Cantidad</label>
                <input type="number" id="${idPrefix}cantidad-producto" class="form-control" value="${producto.cantidad}">
            </div>
            <div class="col-md-6">
                <label for="${idPrefix}unidad-producto" class="form-label">Unidad</label>
                <select id="${idPrefix}unidad-producto" class="form-select">
                    <option value="ud" ${producto.unidad === 'ud' ? 'selected' : ''}>Ud</option>
                    <option value="kg" ${producto.unidad === 'kg' ? 'selected' : ''}>kg</option>
                    <option value="g" ${producto.unidad === 'g' ? 'selected' : ''}>g</option>
                    <option value="l" ${producto.unidad === 'l' ? 'selected' : ''}>l</option>
                </select>
            </div>
        </div>
        <div class="mb-3">
            <label for="${idPrefix}precio-producto" class="form-label">Precio Unitario</label>
            <div class="input-group">
                <input type="number" id="${idPrefix}precio-producto" class="form-control" value="${producto.precioUnitario}" step="0.01" min="0">
                <span class="input-group-text">${precioLabel}</span>
            </div>
        </div>
        <div class="mb-3">
            <label for="${idPrefix}categoria-producto" class="form-label">Categoría</label>
            <select id="${idPrefix}categoria-producto" class="form-select"></select>
        </div>
        <div class="mb-3">
            <label for="${idPrefix}tienda-producto" class="form-label">Tienda</label>
            <select id="${idPrefix}tienda-producto" class="form-select"></select>
        </div>
        <div class="mb-3">
            <label for="${idPrefix}prioridad-producto" class="form-label">Prioridad</label>
            <select id="${idPrefix}prioridad-producto" class="form-select">
                <option value="baja" ${producto.prioridad === 'baja' ? 'selected' : ''}>Baja</option>
                <option value="media" ${producto.prioridad === 'media' ? 'selected' : ''}>Media</option>
                <option value="alta" ${producto.prioridad === 'alta' ? 'selected' : ''}>Alta</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="${idPrefix}notas-producto" class="form-label">Notas</label>
            <textarea id="${idPrefix}notas-producto" class="form-control" rows="2">${producto.notas}</textarea>
        </div>
    `;
    
    const catSelect = dom.editModalBody.querySelector(`#${idPrefix}categoria-producto`);
    if (catSelect) {
        renderSelect(catSelect, getCategories(), 'Elige...');
        catSelect.value = producto.categoriaId;
    }

    const tiendaSelect = dom.editModalBody.querySelector(`#${idPrefix}tienda-producto`);
    if (tiendaSelect) {
        renderSelect(tiendaSelect, getStores(), 'Elige...');
        tiendaSelect.value = producto.tiendaId;
    }

    dom.editModal.show();
};


const handleGuardarEdicion = () => {
    const id = document.getElementById('edit-producto-id').value;
    if (!id) return; // Safety check
    const idPrefix = `edit-${id}-`;

    const nombreInput = document.getElementById(`${idPrefix}nombre-producto`).value;
    const cantidadInput = document.getElementById(`${idPrefix}cantidad-producto`).value;
    const precioInput = document.getElementById(`${idPrefix}precio-producto`).value;

    const validacion = validarProducto(nombreInput, cantidadInput, precioInput);

    if (validacion.error) {
        return mostrarNotificacion(validacion.error, 'error');
    }

    const productData = {
        nombre: validacion.nombre,
        cantidad: validacion.cantidad,
        unidad: document.getElementById(`${idPrefix}unidad-producto`).value,
        precioUnitario: validacion.precio,
        categoriaId: document.getElementById(`${idPrefix}categoria-producto`).value,
        tiendaId: document.getElementById(`${idPrefix}tienda-producto`).value,
        prioridad: document.getElementById(`${idPrefix}prioridad-producto`).value,
        notas: document.getElementById(`${idPrefix}notas-producto`).value.trim(),
    };

    const result = updateProduct(id, productData);

    if (result.success) {
        dom.editModal.hide();
        render();
        mostrarNotificacion(result.message, 'success');
    } else {
        mostrarNotificacion(result.message, 'error');
    }
};

const handleInputProducto = (e) => {
    const valorInput = e.target.value;
    const nombreNormalizado = normalizar(valorInput);

    const categoriaSugeridaNombre = state.productoCategoriaMapNormalizado[nombreNormalizado];
    if (categoriaSugeridaNombre) {
        const categoria = getCategories().find(c => c.nombre === categoriaSugeridaNombre);
        if (categoria) {
            dom.categoriaProductoSelect.value = categoria.id;
        }
    }

    if (valorInput.length > 0) {
        const sugerenciasFiltradas = state.listaAutocompletado.filter(p => 
            normalizar(p).startsWith(nombreNormalizado)
        ).slice(0, 10);
        renderSugerencias(sugerenciasFiltradas);
    } else {
        renderSugerencias(state.listaAutocompletado.slice(0, 10));
    }
};

const handleBtnVozClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        return mostrarNotificacion('El reconocimiento de voz no es compatible con tu navegador.', 'error');
    }
    const recognition = new SpeechRecognition();
    const micIcon = dom.btnVoz.querySelector('.icon-microfono');

    recognition.lang = 'es-ES';

    recognition.onstart = () => {
        micIcon.classList.add('blinking');
    };

    recognition.onresult = (event) => {
        dom.nombreProductoInput.value = capitalizar(event.results[0][0].transcript);
        dom.nombreProductoInput.dispatchEvent(new Event('input'));
    };

    const stopBlinking = () => {
        micIcon.classList.remove('blinking');
    };

    recognition.onerror = (event) => {
        mostrarNotificacion(`Error en reconocimiento de voz: ${event.error}`, 'error');
        stopBlinking();
    };

    recognition.onend = () => {
        stopBlinking();
    };

    recognition.start();
};

const handleAnadirProducto = () => {
    const nombreInput = dom.nombreProductoInput.value;
    const cantidadInput = dom.cantidadProductoInput.value;
    const precioInput = dom.precioProductoInput.value;

    const validacion = validarProducto(nombreInput, cantidadInput, precioInput);

    if (validacion.error) {
        return mostrarNotificacion(validacion.error, 'error');
    }

    const productData = {
        nombre: validacion.nombre,
        cantidad: validacion.cantidad,
        unidad: dom.unidadProductoSelect.value,
        precioUnitario: validacion.precio,
        categoriaId: dom.categoriaProductoSelect.value,
        tiendaId: dom.tiendaProductoSelect.value,
        notas: dom.notasProductoInput.value.trim(),
        prioridad: dom.prioridadProductoSelect.value,
    };

    const result = addProduct(productData);

    if (result.success) {
        render();
        mostrarNotificacion(result.message, 'success');
        [dom.nombreProductoInput, dom.cantidadProductoInput, dom.precioProductoInput, dom.notasProductoInput].forEach(i => i.value = '');
        [dom.categoriaProductoSelect, dom.tiendaProductoSelect].forEach(s => s.selectedIndex = 0);
        dom.prioridadProductoSelect.value = 'baja';
    } else {
        mostrarNotificacion(result.message, 'error');
    }
};

const handleOrdenar = () => {
    const ordenes = ['categoria', 'alfa', 'coste'];
    const ordenesNombres = { 'categoria': 'Categoría', 'alfa': 'Nombre', 'coste': 'Coste' };
    const iconMap = { categoria: 'bi-bookshelf', alfa: 'bi-sort-alpha-down', coste: 'bi-currency-euro' };

    let currentIndex = ordenes.indexOf(state.modoOrden);
    if (currentIndex === -1) currentIndex = 0;

    const nextIndex = (currentIndex + 1) % ordenes.length;
    state.modoOrden = ordenes[nextIndex];

    if (state.modoOrden === 'coste') state.costeOrden = 'asc';

    dom.btnOrdenar.innerHTML = `<i class="bi ${iconMap[state.modoOrden]}"></i>`;
    const nextNextIndex = (nextIndex + 1) % ordenes.length;
    dom.btnOrdenar.title = `Ordenar por ${ordenesNombres[ordenes[nextNextIndex]]}`;

    renderProductos();
};

const handleExportar = (format) => {
    dom.exportImportModal.hide();
    renderExportSelection();
    dom.btnConfirmarExportacion.dataset.format = format;
    dom.exportSelectionModal.show();
};

const exportToTxt = (productos) => {
    let contenido = 'Lista de Compras\n=================\n';
    productos.forEach(p => {
        const tienda = state.mapaTiendas.get(p.tiendaId);
        
        // Construir las partes de la línea
        let partes = [
            `[${p.comprado ? 'x' : ' '}]`,
            p.nombre
        ];

        if (p.cantidad && p.unidad) {
            partes.push(`(${p.cantidad} ${p.unidad})`);
        }
        if (tienda && tienda.nombre) {
            partes.push(`@ ${tienda.nombre}`);
        }
        if (p.precioTotalCalculado > 0) {
            partes.push(`- ${p.precioTotalCalculado.toFixed(2)}€`);
        }
        partes.push(`(Prioridad: ${p.prioridad || 'baja'})`);
        if (p.notas) {
            partes.push(`(Nota: ${p.notas})`);
        }

        // Unir las partes con un espacio y añadir a contenido
        contenido += partes.join(' ').trim().replace(/\s+/g, ' ') + '\n';
    });

    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lista-compras.txt';
    a.click();
    URL.revokeObjectURL(url);
};

const exportToJpg = (productos) => {
    if (typeof html2canvas === 'undefined') {
        return mostrarNotificacion('La librería para exportar a JPG no está disponible.', 'error');
    }

    const exportContainer = document.createElement('div');
    exportContainer.style.width = '900px';
    exportContainer.style.padding = '20px';
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    document.body.appendChild(exportContainer);

    renderProductos(productos, true, exportContainer);
    
    mostrarNotificacion('Exportando a JPG... Espere.', 'info');
    
    try {
        html2canvas(exportContainer, {
            scale: 2,
            backgroundColor: '#f8f9fa'
        }).then(canvas => {
            const a = document.createElement('a');
            a.href = canvas.toDataURL('image/jpeg', 0.9);
            a.download = 'lista-compras.jpg';
            a.click();
        });
    } finally {
        document.body.removeChild(exportContainer);
    }
};

const handleConfirmarExportacion = () => {
    const format = dom.btnConfirmarExportacion.dataset.format;
    if (!format) return;
    const checkboxes = dom.exportSelectionBody.querySelectorAll('.export-item-check:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);
    const productosSeleccionados = state.productos.filter(p => selectedIds.includes(p.id));
    if (productosSeleccionados.length === 0) return mostrarNotificacion('Seleccione al menos un producto.', 'info');

    switch (format) {
        case 'txt': exportToTxt(productosSeleccionados); break;
        case 'jpg': exportToJpg(productosSeleccionados); break;
        case 'pdf': generarPdfLista(productosSeleccionados, state); break;
    }
    dom.exportSelectionModal.hide();
};

const handleExportarSeleccionarTodo = (e) => {
    if (e.target.id === 'export-select-all' || e.target.id === 'export-deselect-all') {
        const shouldBeChecked = e.target.id === 'export-select-all';
        const itemCheckboxes = dom.exportSelectionBody.querySelectorAll('.export-item-check');
        itemCheckboxes.forEach(cb => cb.checked = shouldBeChecked);
    }
};

const handleImportarTxt = (event) => {
    dom.exportImportModal.hide();
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const { productosParseados, lineasConError } = parsearTextoImportado(e.target.result, state);
        productosAImportar = productosParseados;
        renderImportPreview(productosParseados, lineasConError);
        dom.importPreviewModal.show();
        event.target.value = '';
    };
    reader.onerror = () => mostrarNotificacion('No se pudo leer el archivo.', 'error');
    reader.readAsText(file, 'UTF-8');
};

const handleAnadirOpcionGestion = (tipo) => {
    const esCategoria = tipo === 'categoria';
    const input = esCategoria ? dom.nuevaCategoriaInput : dom.nuevaTiendaInput;
    const nombre = input.value;
    const result = esCategoria ? addCategory(nombre) : addStore(nombre);

    if (result.success) {
        renderGestion();
        render();
        input.value = '';
    }
    mostrarNotificacion(result.message, result.success ? 'success' : 'warning');
};

const abrirModalEdicionNombre = (id, type, currentName) => {
    const modal = new bootstrap.Modal(document.getElementById('editNameModal'));
    document.getElementById('edit-name-id').value = id;
    document.getElementById('edit-name-type').value = type;
    document.getElementById('edit-name-input').value = currentName;
    modal.show();
};

const handleGuardarNombreEditado = () => {
    const id = document.getElementById('edit-name-id').value; // Para categoría/tienda es el ID, para autocompletado es el nombre antiguo.
    const type = document.getElementById('edit-name-type').value;
    const nuevoNombre = document.getElementById('edit-name-input').value;
    const modal = bootstrap.Modal.getInstance(document.getElementById('editNameModal'));

    let result = {};

    switch (type) {
        case 'categoria':
            result = editCategory(id, nuevoNombre);
            break;
        case 'tienda':
            result = editStore(id, nuevoNombre);
            break;
        case 'autocompletado':
            result = editAutocompleteItem(id, nuevoNombre);
            break;
    }

    if (result.success) {
        renderGestion();
        render(); // Re-render para reflejar cualquier cambio (ej. sugerencias, nombres de productos)
    }

    if (result.message) {
        mostrarNotificacion(result.message, result.success ? 'success' : 'warning');
    }

    modal.hide();
};

const handleGestionClick = (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    const li = target.closest('li');
    if (!li) return;

    const id = li.dataset.id;
    const isCategoria = li.closest('ul').id === 'lista-categorias';
    const itemType = isCategoria ? 'categoria' : 'tienda';
    const itemMap = isCategoria ? state.mapaCategorias : state.mapaTiendas;
    const deleteFn = isCategoria ? deleteCategory : deleteStore;

    const item = itemMap.get(id);
    if (!item) return;

    if (target.classList.contains(`btn-eliminar-${itemType}`)) {
        mostrarConfirmacion(`¿Seguro que quieres eliminar la ${itemType} "${item.nombre}"?`, () => {
            const result = deleteFn(id);
            if (result.success) {
                li.remove();
                render();
            }
            mostrarNotificacion(result.message, result.success ? 'success' : 'error');
        });
    } else if (target.classList.contains(`btn-editar-${itemType}`)) {
        abrirModalEdicionNombre(id, itemType, item.nombre);
    }
};

const handleAutocompletadoGestionClick = (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    const li = target.closest('li');
    const nombre = li.dataset.nombre;
    if (!nombre) return;

    if (target.classList.contains('btn-eliminar-autocompletado')) {
        mostrarConfirmacion(`¿Seguro que quieres eliminar "${nombre}" del autocompletado?`, () => {
            const result = removeFromAutocomplete(nombre);
            if (result.success) {
                renderGestion();
                renderSugerencias();
            }
            mostrarNotificacion(result.message, result.success ? 'success' : 'error');
        });
    } else if (target.classList.contains('btn-editar-autocompletado')) {
        abrirModalEdicionNombre(nombre, 'autocompletado', nombre);
    }
};

const handleListaComprasClick = (e) => {
    const item = e.target.closest('.producto-item');
    if (!item || !item.dataset) return;
    const id = item.dataset.id;

    if (e.target.closest('.check-comprado')) {
        const result = toggleProductStatus(id);
        if (result.success) {
            item.classList.toggle('comprado', result.data.comprado);
            renderTotales();
        }
    } else if (e.target.closest('.btn-eliminar')) {
        const producto = state.productos.find(p => p.id === id); // Find for confirmation message
        if (!producto) return;
        
        mostrarConfirmacion(`¿Seguro que quieres eliminar "${producto.nombre}"?`, () => {
            const result = deleteProduct(id);
            if (result.success) {
                item.closest('.col').remove();
                renderTotales();
                mostrarNotificacion(`"${producto.nombre}" eliminado.`, 'success');
            }
        });
    } else if (e.target.closest('.btn-editar')) {
        const producto = state.productos.find(p => p.id === id);
        if (producto) {
            abrirModalEdicion(producto);
        }
    }
};

const handleImportarSeleccionarTodo = (e) => {
    if (e.target.id === 'import-select-all' || e.target.id === 'import-deselect-all') {
        const shouldBeChecked = e.target.id === 'import-select-all';
        const itemCheckboxes = dom.importPreviewBody.querySelectorAll('.import-item-check');
        itemCheckboxes.forEach(cb => cb.checked = shouldBeChecked);
    }
};

const handleConfirmarImportacion = () => {
    const checkboxes = dom.importPreviewBody.querySelectorAll('.import-item-check:checked');
    const indicesSeleccionados = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
    const productosSeleccionados = productosAImportar.filter((p, index) => indicesSeleccionados.includes(index));
    if (productosSeleccionados.length === 0) {
        dom.importPreviewModal.hide();
        return;
    }
    const baseId = Date.now();
    const nuevosProductos = productosSeleccionados.map((p, index) => ({ ...p, id: `${baseId}-${index}-${Math.random().toString(36).substr(2, 9)}` }));
    state.productos.push(...nuevosProductos);
    productosAImportar = [];
    dom.importPreviewModal.hide();
    render();
    renderImportResult(nuevosProductos);
    dom.importResultModal.show();
};

const handleLimpiarFiltros = () => {
    dom.busquedaInput.value = '';
    dom.filtroTiendaSelect.value = 'all';
    dom.filtroPrioridadSelect.value = 'all';
    renderProductos();
};

const handleOcultarComprados = () => {
    state.compradosOcultos = !state.compradosOcultos;
    dom.btnOcultarComprados.textContent = state.compradosOcultos ? 'Mostrar comprados' : 'Ocultar comprados';
    renderProductos();
    mostrarNotificacion(state.compradosOcultos ? 'Productos comprados ocultos.' : 'Mostrando todos los productos.', 'success');
};

const handleBorrarComprados = () => {
    const productosComprados = state.productos.filter(p => p.comprado);
    if (productosComprados.length === 0) {
        return mostrarNotificacion('No hay productos comprados para borrar.', 'info');
    }
    
    mostrarConfirmacion(`¿Seguro que quieres borrar ${productosComprados.length} producto(s) comprado(s)?`, () => {
        state.productos = state.productos.filter(p => !p.comprado);
        render();
        mostrarNotificacion('Se han borrado los productos comprados.', 'success');
    });
};

const handleBorrarTodo = () => {
    const productosFiltrados = getProductosFiltrados(state, dom);
    if (productosFiltrados.length === 0) {
        return mostrarNotificacion('No hay productos en la lista para borrar.', 'info');
    }

    const mensaje = `¿Seguro que quieres borrar ${productosFiltrados.length} producto(s) de la vista actual?`;
    
    mostrarConfirmacion(mensaje, () => {
        const idsFiltrados = new Set(productosFiltrados.map(p => p.id));
        state.productos = state.productos.filter(p => !idsFiltrados.has(p.id));
        render();
        mostrarNotificacion('Se han borrado los productos seleccionados.', 'success');
    });
};

export function setupEventListeners() {
    dom.unidadProductoSelect.addEventListener('change', actualizarLabelPrecio);
    dom.btnAnadir.addEventListener('click', handleAnadirProducto);
    dom.nombreProductoInput.addEventListener('input', handleInputProducto);
    dom.btnVoz.addEventListener('click', handleBtnVozClick);
    dom.listaComprasContainer.addEventListener('click', handleListaComprasClick);
    dom.busquedaInput.addEventListener('input', renderProductos);
    dom.filtroTiendaSelect.addEventListener('change', renderProductos);
    dom.filtroPrioridadSelect.addEventListener('change', renderProductos);
    dom.btnLimpiarFiltros.addEventListener('click', handleLimpiarFiltros);
    dom.btnGuardarEdicion.addEventListener('click', handleGuardarEdicion);
    dom.btnSaveName.addEventListener('click', handleGuardarNombreEditado);
    dom.btnOrdenar.addEventListener('click', handleOrdenar);

    // Dropdown de la papelera
    dom.btnOcultarComprados.addEventListener('click', handleOcultarComprados);
    dom.btnBorrarComprados.addEventListener('click', handleBorrarComprados);
    dom.btnBorrarTodo.addEventListener('click', handleBorrarTodo);

    // Exportar / Importar
    dom.btnExportTxt.addEventListener('click', () => handleExportar('txt'));
    dom.btnExportJpg.addEventListener('click', () => handleExportar('jpg'));
    dom.btnExportPdf.addEventListener('click', () => handleExportar('pdf'));
    dom.importFileInput.addEventListener('change', handleImportarTxt);
    dom.btnConfirmarImportacion.addEventListener('click', handleConfirmarImportacion);
    dom.importPreviewBody.addEventListener('click', handleImportarSeleccionarTodo);
    dom.btnConfirmarExportacion.addEventListener('click', handleConfirmarExportacion);
    dom.exportSelectionBody.addEventListener('click', handleExportarSeleccionarTodo);
    dom.btnAyudaImportar.addEventListener('click', () => dom.importHelpModal.show());
    dom.btnAyudaImportar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            dom.importHelpModal.show();
        }
    });

    // Listeners para el Modal de Gestión
    dom.gestionModal.addEventListener('shown.bs.modal', renderGestion);
    dom.btnAnadirCategoria.addEventListener('click', () => handleAnadirOpcionGestion('categoria'));
    dom.btnAnadirTienda.addEventListener('click', () => handleAnadirOpcionGestion('tienda'));
    dom.filtroAutocompletadoInput.addEventListener('input', renderGestion);
    dom.listaCategoriasUl.addEventListener('click', handleGestionClick);
    dom.listaTiendasUl.addEventListener('click', handleGestionClick);
    dom.listaAutocompletadoUl.addEventListener('click', handleAutocompletadoGestionClick);

    // Listener para el slider de tamaño de letra
    dom.rangoTamanoLetra.addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        let sizeClass = 'font-size-normal';
        if (value > 20) {
            sizeClass = 'font-size-xlarge';
        } else if (value > 16) {
            sizeClass = 'font-size-large';
        }
        document.documentElement.className = sizeClass;
        localStorage.setItem('fontSizeClass', sizeClass);
    });

    let elementoQueDisparoElModal = null;
    const guardarElementoDisparador = (event) => { elementoQueDisparoElModal = event.relatedTarget; };
    const devolverFoco = () => { if (elementoQueDisparoElModal) elementoQueDisparoElModal.focus(); };
    
    const todosLosModales = [ dom.exportSelectionModal, dom.importPreviewModal, dom.importResultModal, dom.editModal, dom.gestionModal, dom.confirmModal, dom.exportImportModal, dom.importHelpModal ];
    todosLosModales.filter(Boolean).forEach(modal => {
        const elementoModal = modal._element ? modal._element : modal;
        elementoModal.addEventListener('show.bs.modal', guardarElementoDisparador);
        elementoModal.addEventListener('hidden.bs.modal', devolverFoco);
    });
}