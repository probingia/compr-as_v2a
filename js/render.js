import { dom } from './dom.js';
import { state, getCategories, getStores } from './state.js';
import { saveState } from './db.js';
import { normalizar, agruparPorCategoria, capitalizar, getProductosFiltrados } from './utils.js';

const crearElementoProducto = (p, isExport = false) => {
    const col = document.createElement('div');
    col.className = 'col';

    const priorityClass = p.prioridad || 'baja';
    const tienda = state.mapaTiendas.get(p.tiendaId);
    const tiendaNombre = tienda ? tienda.nombre : 'Sin tienda';
    
    const precioTotalTexto = p.precioTotalCalculado > 0 ? `${p.precioTotalCalculado.toFixed(2)}€` : 'Sin precio';
    const precioUnitarioTexto = p.precioUnitario > 0 ? `(${p.precioUnitario.toFixed(2)}€ / ${p.unidad})` : '';

    // Card
    const card = document.createElement('div');
    card.className = `card h-100 producto-item prioridad-${priorityClass} ${p.comprado ? 'comprado' : ''}`;
    card.dataset.id = p.id;

    // Card Body
    const cardBody = document.createElement('div');
    cardBody.className = 'card-body';

    // Flex container
    const dFlex = document.createElement('div');
    dFlex.className = 'd-flex align-items-start';

    // Checkbox container
    const checkContainer = document.createElement('div');
    checkContainer.className = 'pt-1';
    const checkbox = document.createElement('input');
    checkbox.className = 'form-check-input check-comprado';
    checkbox.type = 'checkbox';
    checkbox.checked = p.comprado;
    checkbox.id = `check-${p.id}`;
    checkContainer.appendChild(checkbox);

    // Main content container
    const mainContent = document.createElement('div');
    mainContent.className = 'ms-2 flex-grow-1';

    // Label
    const label = document.createElement('label');
    label.className = 'form-check-label w-100';
    label.htmlFor = `check-${p.id}`;

    const nombreSpan = document.createElement('span');
    nombreSpan.className = 'fw-bold fs-5';
    nombreSpan.textContent = p.nombre; // SAFE
    label.appendChild(nombreSpan);

    if (p.importado) {
        const importadoIndicator = document.createElement('span');
        importadoIndicator.className = 'badge bg-info-subtle text-info-emphasis rounded-pill ms-2 position-relative';
        importadoIndicator.style.top = '-2px';
        importadoIndicator.textContent = 'Importado'; // SAFE
        const importadoIcon = document.createElement('i');
        importadoIcon.className = 'bi bi-question-circle-fill ms-1';
        importadoIcon.title = 'Precio sin actualizar';
        importadoIndicator.appendChild(importadoIcon);
        label.appendChild(importadoIndicator);
    }

    // Details container
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'd-flex justify-content-between align-items-end';

    // Details <p>
    const pDetails = document.createElement('p');
    pDetails.className = 'card-text text-muted small mt-1 mb-0';
    
    pDetails.appendChild(document.createTextNode(`${p.cantidad} ${p.unidad} | `));
    const precioTotalSpan = document.createElement('span');
    precioTotalSpan.className = 'fw-bold';
    precioTotalSpan.textContent = precioTotalTexto;
    pDetails.appendChild(precioTotalSpan);
    const precioUnitarioSpan = document.createElement('span');
    precioUnitarioSpan.className = 'text-body-secondary';
    precioUnitarioSpan.textContent = ` ${precioUnitarioTexto}`;
    pDetails.appendChild(precioUnitarioSpan);
    pDetails.appendChild(document.createElement('br'));
    pDetails.appendChild(document.createTextNode(tiendaNombre));

    if (p.notas) {
        pDetails.appendChild(document.createElement('br'));
        const notasEm = document.createElement('em');
        notasEm.textContent = p.notas; // SAFE
        pDetails.appendChild(notasEm);
    }

    // Buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'd-flex flex-shrink-0 ms-2';

    if (!isExport) {
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-sm btn-outline-primary btn-editar me-1';
        editButton.title = 'Editar';
        editButton.innerHTML = '<i class="bi bi-pencil"></i>'; // Icon, safe
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm btn-outline-danger btn-eliminar';
        deleteButton.title = 'Eliminar';
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>'; // Icon, safe

        buttonsContainer.appendChild(editButton);
        buttonsContainer.appendChild(deleteButton);
    }

    // Assemble everything
    detailsContainer.appendChild(pDetails);
    detailsContainer.appendChild(buttonsContainer);

    mainContent.appendChild(label);
    mainContent.appendChild(detailsContainer);

    dFlex.appendChild(checkContainer);
    dFlex.appendChild(mainContent);

    cardBody.appendChild(dFlex);
    card.appendChild(cardBody);
    col.appendChild(card);

    return col;
};

export const renderTotales = () => {
    const productosAMostrar = getProductosFiltrados(state, dom);
    dom.totalProductosSpan.textContent = productosAMostrar.length;
    const costeTotal = productosAMostrar.reduce((total, p) => total + (p.precioTotalCalculado || 0), 0);
    dom.costeTotalSpan.textContent = costeTotal.toFixed(2);
};

export const renderProductos = (productos = null, isExport = false, container = dom.listaComprasContainer) => {
    const productosAMostrarSinOrdenar = Array.isArray(productos) ? productos : getProductosFiltrados(state, dom);

    if (!isExport) { 
        const sonFiltrosActivos = dom.busquedaInput.value !== '' || dom.filtroTiendaSelect.value !== 'all' || dom.filtroPrioridadSelect.value !== 'all';
        dom.activeFiltersBar.classList.toggle('d-none', !sonFiltrosActivos);
    }

    container.innerHTML = '';

    let productosAMostrar = [...productosAMostrarSinOrdenar];

    if (state.modoOrden === 'coste') {
        productosAMostrar.sort((a, b) => {
            const costeA = a.precioTotalCalculado || 0;
            const costeB = b.precioTotalCalculado || 0;
            return state.costeOrden === 'asc' ? costeA - costeB : costeB - costeA;
        });
    } else if (state.modoOrden === 'alfa') {
        productosAMostrar.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }

    if (!isExport) {
        renderTotales();
    }

    if (productosAMostrar.length === 0) {
        container.innerHTML = '<div class="alert alert-info">No hay productos en la lista.</div>';
        return;
    }

    if (state.modoOrden !== 'categoria') {
        container.className = 'row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4';
        productosAMostrar.forEach(p => container.appendChild(crearElementoProducto(p, isExport)));
    } else {
        container.className = '';
        const productosAgrupados = agruparPorCategoria(productosAMostrar);
        Object.keys(productosAgrupados).sort((a, b) => {
            const catA = state.mapaCategorias.get(a)?.nombre || 'Sin Categoría';
            const catB = state.mapaCategorias.get(b)?.nombre || 'Sin Categoría';
            return catA.localeCompare(catB);
        }).forEach(categoriaId => {
            const categoria = state.mapaCategorias.get(categoriaId) || { nombre: 'Sin Categoría' };
            const categoriaWrapper = document.createElement('div');
            categoriaWrapper.className = 'mb-4';
            const badgeHTML = isExport ? '' : `<span class="badge bg-secondary float-end">${productosAgrupados[categoriaId].length}</span>`;
            categoriaWrapper.innerHTML = `<h4 class="categoria-header border-bottom pb-2 mb-3">${categoria.nombre} ${badgeHTML}</h4>`;
            const grid = document.createElement('div');
            grid.className = 'row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4';
            productosAgrupados[categoriaId].sort((a, b) => a.nombre.localeCompare(b.nombre));
            productosAgrupados[categoriaId].forEach(p => grid.appendChild(crearElementoProducto(p, isExport)));
            categoriaWrapper.appendChild(grid);
            container.appendChild(categoriaWrapper);
        });
    }
};

export const renderSugerencias = (sugerencias) => {
    dom.sugerenciasDataList.innerHTML = '';
    const sugerenciasAMostrar = sugerencias || state.listaAutocompletado.slice(0, 10);
    sugerenciasAMostrar.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto;
        dom.sugerenciasDataList.appendChild(option);
    });
};

export const renderSelect = (select, items, placeholder, placeholderValue = "") => {
    const currentValue = select.value;
    select.innerHTML = `<option selected disabled value="${placeholderValue}">${placeholder}</option>`;
    items.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })).forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.nombre;
        select.appendChild(option);
    });
    if (placeholderValue === 'all') {
        select.firstChild.value = 'all';
    }
    select.value = currentValue;
};

const crearFilaSeleccionHTML = (p, options) => {
    const tienda = state.mapaTiendas.get(p.tiendaId) || { nombre: (p.tiendaNombre || 'N/A') };
    const notas = p.notas || '';
    const notasCortas = notas.length > 25 ? notas.substring(0, 22) + '...' : notas;

    const checkboxHtml = options.type === 'import'
        ? `<input class="form-check-input import-item-check" type="checkbox" data-index="${options.index}" checked>`
        : `<input class="form-check-input export-item-check" type="checkbox" value="${p.id}" checked>`;

    return `<tr>
        <td>${checkboxHtml}</td>
        <td>${p.nombre}</td>
        <td>${p.cantidad} ${p.unidad.toLowerCase().startsWith('ud') ? 'ud' : p.unidad}</td>
        <td>${p.precioTotalCalculado.toFixed(2)}€</td>
        <td>${tienda.nombre}</td>
        <td title="${notas}">${notasCortas}</td>
        <td>${p.comprado ? '<i class="bi bi-check-square-fill text-success"></i>' : '<i class="bi bi-square"></i>'}</td>
    </tr>`;
};

export const renderImportPreview = (productos, errores) => {
    let content = '';
    if (productos.length > 0) {
        const filas = productos.map((p, index) => crearFilaSeleccionHTML(p, { type: 'import', index })).join('');
        content = `
            <h5><i class="bi bi-check-circle-fill text-success"></i> ${productos.length} Productos Listos para Importar</h5>
            <div class="d-flex justify-content-end mb-2">
                <button class="btn btn-link btn-sm" id="import-select-all">Marcar todos</button>
                <button class="btn btn-link btn-sm" id="import-deselect-all">Desmarcar todos</button>
            </div>
            <div class="table-responsive">
                <table class="table table-sm table-striped table-hover">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Producto</th>
                            <th>Cant.</th>
                            <th>Precio</th>
                            <th>Tienda</th>
                            <th>Notas</th>
                            <th>Comprado</th>
                        </tr>
                    </thead>
                    <tbody>${filas}</tbody>
                </table>
            </div>`;
    } else {
        content = '<div class="alert alert-warning">No se encontraron productos válidos en el archivo para importar.</div>';
    }

    dom.importPreviewBody.innerHTML = content;
    dom.btnConfirmarImportacion.disabled = productos.length === 0;
};

export const renderExportSelection = () => {
    const productosAMostrar = getProductosFiltrados(state, dom);

    // Ordenar siempre alfabéticamente para la previsualización
    productosAMostrar.sort((a, b) => a.nombre.localeCompare(b.nombre));

    let content = '';
    if (productosAMostrar.length > 0) {
        const filas = productosAMostrar.map(p => crearFilaSeleccionHTML(p, { type: 'export' })).join('');
        content = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <p class="mb-0 text-muted small">Mostrando ${productosAMostrar.length} de ${state.productos.length} productos para exportar.</p>
                <div>
                    <button class="btn btn-link btn-sm" id="export-select-all">Marcar todos</button>
                    <button class="btn btn-link btn-sm" id="export-deselect-all">Desmarcar todos</button>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-sm table-striped table-hover">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Producto</th>
                            <th>Cant.</th>
                            <th>Precio</th>
                            <th>Tienda</th>
                            <th>Notas</th>
                            <th>Comprado</th>
                        </tr>
                    </thead>
                    <tbody>${filas}</tbody>
                </table>
            </div>`;
    } else {
        content = '<div class="alert alert-warning">No hay productos que coincidan con los filtros actuales para exportar.</div>';
    }

    dom.exportSelectionBody.innerHTML = content;
    dom.btnConfirmarExportacion.disabled = productosAMostrar.length === 0;
};


export const renderImportResult = (productosImportados) => {
    let content = '';
    if (productosImportados.length > 0) {
        content = `<div class="alert alert-success mb-0">
            <h5><i class="bi bi-check-circle-fill"></i> ¡Importación completada!</h5>
            <p>Se han añadido <strong>${productosImportados.length}</strong> nuevos productos a tu lista.</p>
        </div>`;
    } else {
        content = `<div class="alert alert-warning mb-0">
            <h5>No se importaron productos.</h5>
            <p>No se añadieron nuevos productos a tu lista.</p>
        </div>`;
    }
    dom.importResultBody.innerHTML = content;
};

export const renderGestion = () => {
    // Renderizar Categorías
    dom.listaCategoriasUl.innerHTML = '';
    getCategories()
        .sort((a, b) => a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase()))
        .forEach(c => {
            const item = document.createElement('li');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            item.dataset.id = c.id;
            item.innerHTML = `<span>${c.nombre}</span>
                <div>
                    <button class="btn btn-sm btn-outline-primary btn-editar-categoria me-2" title="Editar"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger btn-eliminar-categoria" title="Eliminar"><i class="bi bi-trash"></i></button>
                </div>`;
            dom.listaCategoriasUl.appendChild(item);
        });

    // Renderizar Tiendas
    dom.listaTiendasUl.innerHTML = '';
    getStores()
        .sort((a, b) => a.nombre.toLowerCase().localeCompare(b.nombre.toLowerCase()))
        .forEach(t => {
            const item = document.createElement('li');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            item.dataset.id = t.id;
            item.innerHTML = `<span>${t.nombre}</span>
                <div>
                    <button class="btn btn-sm btn-outline-primary btn-editar-tienda me-2" title="Editar"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger btn-eliminar-tienda" title="Eliminar"><i class="bi bi-trash"></i></button>
                </div>`;
            dom.listaTiendasUl.appendChild(item);
        });

    // Renderizar Autocompletado
    const filtro = dom.filtroAutocompletadoInput ? dom.filtroAutocompletadoInput.value.toLowerCase() : '';
    const listaFiltrada = state.listaAutocompletado.filter(p => p.toLowerCase().includes(filtro));

    dom.listaAutocompletadoUl.innerHTML = '';
    listaFiltrada.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).forEach(p => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.dataset.nombre = p;
        item.innerHTML = `<span>${p}</span>
            <div>
                <button class="btn btn-sm btn-outline-primary btn-editar-autocompletado me-2" title="Editar"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger btn-eliminar-autocompletado" title="Eliminar"><i class="bi bi-trash"></i></button>
            </div>`;
        dom.listaAutocompletadoUl.appendChild(item);
    });
};


export const render = async () => {
    renderSugerencias();
    renderSelect(dom.categoriaProductoSelect, getCategories(), 'Elige categoría...');
    renderSelect(dom.tiendaProductoSelect, getStores(), 'Elige tienda...');
    renderSelect(dom.filtroTiendaSelect, getStores(), 'Tienda', 'all');
    renderProductos();
    await saveState(state);
};

export const actualizarLabelPrecio = () => {
    const unidad = dom.unidadProductoSelect.value;
    let label = '€ / ud';
    if (unidad === 'kg' || unidad === 'g') {
        label = '€ / kg';
    } else if (unidad === 'l') {
        label = '€ / l';
    }
    dom.precioUnidadLabel.textContent = label;
};