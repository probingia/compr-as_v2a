import { dom, initializeDOM } from './js/dom.js';
import { cargarEstado, cargarDatosIniciales } from './js/api.js';
import { render, actualizarLabelPrecio } from './js/render.js';
import { setupEventListeners } from './js/events.js';
import { mostrarNotificacion } from './js/notifications.js';
import { initializeConfirmModal } from './js/confirm.js';

const init = async () => {
    // Primero, inicializamos las referencias del DOM ahora que la página ha cargado.
    initializeDOM();
    initializeConfirmModal();

    console.log('Inicializando Compr-As...');
    dom.loadingOverlay.classList.remove('d-none'); // Show spinner

    try {
        await cargarEstado(); // Cargar estado desde IndexedDB
        await cargarDatosIniciales(); // Cargar datos iniciales si la BD estaba vacía

        // Cargar y aplicar el tamaño de fuente guardado
        const savedFontSize = localStorage.getItem('fontSize');
        if (savedFontSize) {
            document.documentElement.style.setProperty('--font-size-base', `${savedFontSize}px`);
            dom.rangoTamanioLetra.value = savedFontSize;
        }

        setupEventListeners();

        actualizarLabelPrecio(); // Para establecer la etiqueta de precio inicial
        dom.btnOrdenar.title = 'Ordenar por Nombre'; // Tooltip inicial
        render();
        console.log('Compr-As inicializado y listo.');
    } catch (error) {
        console.error("Error durante la inicialización:", error);
        mostrarNotificacion("Ocurrió un error grave al iniciar la aplicación. Por favor, recargue la página.", 'error');
    } finally {
        dom.loadingOverlay.classList.add('d-none'); // Hide spinner
    }
};

document.addEventListener('DOMContentLoaded', init);
