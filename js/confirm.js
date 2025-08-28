import { dom } from './dom.js';

let confirmCallback = null;

/**
 * Muestra un modal de confirmación genérico.
 * @param {string} message - El mensaje o pregunta a mostrar en el modal.
 * @param {function} onConfirm - La función callback que se ejecutará si el usuario hace clic en "Aceptar".
 */
export const mostrarConfirmacion = (message, onConfirm) => {
    dom.confirmModalBody.textContent = message;
    confirmCallback = onConfirm; // Guardar el callback
    dom.confirmModal.show();
};

/**
 * Configura los listeners del modal de confirmación. Debe llamarse después de initializeDOM.
 */
export const initializeConfirmModal = () => {
    // Listener para el botón OK
    dom.confirmModalOk.addEventListener('click', () => {
        if (typeof confirmCallback === 'function') {
            confirmCallback();
        }
        confirmCallback = null;
        dom.confirmModal.hide();
    });

    // Listener para ANTES de que el modal se oculte
    dom.confirmModalEl.addEventListener('hide.bs.modal', () => {
        // Si el elemento activo está dentro del modal (como el botón 'X')
        if (dom.confirmModalEl.contains(document.activeElement)) {
            // Quitarle el foco para evitar el 'focus trap' que bloquea el cierre
            document.activeElement.blur();
        }
    });

    // Listener para DESPUÉS de que el modal se haya ocultado
    dom.confirmModalEl.addEventListener('hidden.bs.modal', () => {
        // Limpiar el callback para la siguiente vez que se use el modal
        confirmCallback = null;
    });
};