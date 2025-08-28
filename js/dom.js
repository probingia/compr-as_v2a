export const dom = {};

export const initializeDOM = () => {
    // General
    dom.loadingOverlay = document.getElementById('loading-overlay');
    
    // Formulario Añadir
    dom.nombreProductoInput = document.getElementById('nombre-producto');
    dom.sugerenciasDataList = document.getElementById('sugerencias-productos');
    dom.btnVoz = document.getElementById('btn-voz');
    dom.categoriaProductoSelect = document.getElementById('categoria-producto');
    dom.cantidadProductoInput = document.getElementById('cantidad-producto');
    dom.unidadProductoSelect = document.getElementById('unidad-producto');
    dom.precioProductoInput = document.getElementById('precio-producto');
    dom.precioUnidadLabel = document.getElementById('precio-unidad-label');
    dom.prioridadProductoSelect = document.getElementById('prioridad-producto');
    dom.tiendaProductoSelect = document.getElementById('tienda-producto');
    dom.notasProductoInput = document.getElementById('notas-producto');
    dom.btnAnadir = document.getElementById('btn-anadir');

    // Contenedores y totales
    dom.listaComprasContainer = document.getElementById('lista-compras');
    dom.totalProductosSpan = document.getElementById('total-productos');
    dom.costeTotalSpan = document.getElementById('coste-total');

    // Filtros y controles
    dom.busquedaInput = document.getElementById('busqueda');
    dom.filtroTiendaSelect = document.getElementById('filtro-tienda');
    dom.filtroPrioridadSelect = document.getElementById('filtro-prioridad');
    dom.activeFiltersBar = document.getElementById('active-filters-bar');
    dom.btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');

    // Botonera principal
    dom.btnGestionComprados = document.getElementById('btnGestionComprados');
    dom.btnOcultarComprados = document.getElementById('btnOcultarComprados');
    dom.btnBorrarComprados = document.getElementById('btnBorrarComprados');
    dom.btnBorrarTodo = document.getElementById('btnBorrarTodo');
    dom.btnOrdenar = document.getElementById('btn-ordenar');

    // --- Modales ---
    // Gestión
    dom.gestionModal = document.getElementById('gestionModal');
    dom.nuevaCategoriaInput = document.getElementById('nueva-categoria');
    dom.btnAnadirCategoria = document.getElementById('btn-anadir-categoria');
    dom.listaCategoriasUl = document.getElementById('lista-categorias');
    dom.nuevaTiendaInput = document.getElementById('nueva-tienda');
    dom.btnAnadirTienda = document.getElementById('btn-anadir-tienda');
    dom.listaTiendasUl = document.getElementById('lista-tiendas');
    dom.listaAutocompletadoUl = document.getElementById('lista-autocompletado-gestion');
    dom.filtroAutocompletadoInput = document.getElementById('filtro-autocompletado');
    dom.rangoTamanoLetra = document.getElementById('rangoTamanoLetra');

    // Exportación / Importación
    dom.exportImportModal = new bootstrap.Modal(document.getElementById('exportImportModal'));
    dom.btnExportTxt = document.getElementById('btn-export-txt');
    dom.btnExportJpg = document.getElementById('btn-export-jpg');
    dom.btnExportPdf = document.getElementById('btn-export-pdf');
    dom.importFileInput = document.getElementById('btn-import-txt');
    dom.btnAyudaImportar = document.getElementById('btn-ayuda-importar');
    
    dom.exportSelectionModal = new bootstrap.Modal(document.getElementById('exportSelectionModal'));
    dom.exportSelectionBody = document.getElementById('export-selection-body');
    dom.btnConfirmarExportacion = document.getElementById('btn-confirmar-exportacion');

    dom.importPreviewModal = new bootstrap.Modal(document.getElementById('importPreviewModal'));
    dom.importPreviewBody = document.getElementById('import-preview-body');
    dom.btnConfirmarImportacion = document.getElementById('btn-confirmar-importacion');

    dom.importResultModal = new bootstrap.Modal(document.getElementById('importResultModal'));
    dom.importResultBody = document.getElementById('import-result-body');

    dom.importHelpModal = new bootstrap.Modal(document.getElementById('importHelpModal'));

    // Confirmación
    const confirmModalEl = document.getElementById('confirmModal');
    dom.confirmModal = new bootstrap.Modal(confirmModalEl);
    dom.confirmModalBody = document.getElementById('confirmModalBody');
    dom.confirmModalOk = document.getElementById('confirmModalOk');
    dom.confirmModalEl = confirmModalEl; // Exportar el elemento para el listener

    // Edición
    dom.editModal = new bootstrap.Modal(document.getElementById('editModal'));
    dom.editModalBody = document.querySelector('#editModal .modal-body');
    dom.btnGuardarEdicion = document.getElementById('btn-guardar-edicion');
    dom.btnSaveName = document.getElementById('btn-save-name');
};