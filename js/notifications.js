import { dom } from './dom.js';

/**
 * Muestra una notificación tipo "toast" de Bootstrap en la pantalla.
 * @param {string} message - El mensaje a mostrar.
 * @param {string} type - El tipo de notificación ('info', 'success', 'error').
 */
export const mostrarNotificacion = (message, type = 'info') => {
    const container = document.getElementById('notification-container');
    if (!container) return;

    const colorMap = {
        success: 'bg-success',
        error: 'bg-danger',
        info: 'bg-secondary'
    };

    const toastId = `toast-${Date.now()}`;
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white ${colorMap[type] || colorMap.info} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });

    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });

    toast.show();
};