# Compr-As: Tu Asistente de Compras Inteligente

![Compr-As Logo](assets/icons/icon-512x512.png) <!-- Asumiendo que existe un logo en esta ruta -->

## Descripción del Proyecto

**Compr-As** es una aplicación de lista de compras robusta y flexible, diseñada para ofrecer una experiencia de usuario intuitiva y eficiente. Desarrollada con tecnologías web (HTML, CSS, JavaScript), funciona como una Progressive Web App (PWA) completa, permitiendo su instalación y uso offline. La aplicación se enfoca en la gestión inteligente de productos, categorías y tiendas, con funcionalidades avanzadas de importación/exportación y una interfaz de usuario altamente interactiva.

## Características Principales

*   **PWA Completa:** Instalable y con capacidad offline gracias a un Service Worker dedicado.
*   **Gestión de Productos:** Añade, edita y elimina productos con detalles como notas y prioridad.
*   **Importación/Exportación Selectiva:** Control total sobre los datos importados y exportados, con previsualización de productos individuales.
*   **Exportación a Múltiples Formatos:** Exporta listas a `.txt`, `.jpg` y `.pdf` con diseños personalizables.
*   **Importación Robusta desde TXT:** Analiza archivos `.txt` inteligentemente, previsualiza resultados y maneja información detallada de productos, ignorando líneas irrelevantes.
*   **Ordenación Avanzada y Dinámica:** Ordena listas por Categoría, Nombre, Prioridad y Coste (ascendente/descendente), con tooltips dinámicos.
*   **Gestión Dinámica de Categorías y Tiendas:** Añade y elimina categorías y tiendas en tiempo de ejecución.
*   **Experiencia de Usuario (UX) Mejorada:**
    *   Autocompletado inteligente y reconocimiento de voz para añadir productos.
    *   Filtrado por tienda y búsqueda de texto libre.
    *   Ajuste dinámico del tamaño de fuente para accesibilidad.
    *   Panel de totales destacado para mayor claridad.

## Arquitectura del Proyecto

El proyecto sigue una arquitectura modular clara, con responsabilidades bien definidas en el directorio `js/`:

*   `state.js`: Centraliza el estado de la aplicación.
*   `dom.js`: Abstrae las referencias a elementos del DOM.
*   `api.js`: Gestiona la persistencia en `localStorage` y la carga de datos iniciales.
*   `render.js`: Controla toda la renderización y actualización de la UI.
*   `events.js`: Orquesta todos los eventos y la lógica de interacción del usuario.
*   `utils.js`: Contiene funciones de utilidad compartidas.

## Instalación y Ejecución

Para instalar y ejecutar Compr-As, sigue los siguientes pasos:

1.  **Clonar el Repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO>
    cd Compr-As
    ```

2.  **Abrir con un Servidor Local:**
    Dado que es una aplicación web estática, puedes abrir `index.html` directamente en tu navegador o, para una mejor experiencia (especialmente con Service Workers y PWA), se recomienda usar un servidor web local. Puedes usar `http-server` de Node.js:

    ```bash
    # Si no lo tienes instalado globalmente
    npm install -g http-server

    # Desde la raíz del proyecto
    http-server .
    ```
    Luego, abre tu navegador y navega a `http://localhost:8080` (o el puerto que `http-server` indique).

3.  **Para Desarrollo (Electron/Cordova/Capacitor):**
    Si este proyecto está configurado para Electron, Cordova o Capacitor, necesitarás seguir los pasos específicos de configuración para cada plataforma. Por lo general, esto implica:

    ```bash
    # Para Electron (si aplica)
    npm install
    npm start

    # Para Cordova/Capacitor (si aplica)
    npm install
    npx cap add android # o ios
    npx cap open android # o ios
    ```
    *Nota: Asegúrate de tener Node.js y npm instalados en tu sistema.*

## Uso

Una vez que la aplicación esté en funcionamiento, puedes:

*   Añadir nuevos productos a tu lista de compras.
*   Organizar productos por categorías y tiendas.
*   Marcar productos como comprados.
*   Importar y exportar tus listas para compartirlas o hacer copias de seguridad.
*   Utilizar las opciones de ordenación y filtrado para gestionar tus compras de manera eficiente.

## Mejoras Futuras (Deuda Técnica Menor)

Aunque la aplicación es muy completa, se han identificado las siguientes áreas para futuras mejoras:

1.  **Notificaciones y Feedback al Usuario:** Reemplazar `alert()` por notificaciones más modernas (toasts/snackbars).
2.  **Confirmaciones de Usuario:** Añadir diálogos de confirmación para eliminar categorías o tiendas.
3.  **Guía de Formato de Importación:** Incluir un ícono de ayuda con instrucciones claras y ejemplos para el formato `.txt` de importación.
4.  **Accesibilidad (A11y):** Realizar una auditoría exhaustiva para asegurar el uso correcto de atributos ARIA, contraste de colores y navegación por teclado.
5.  **Refinamiento de UI/UX:** Pulir detalles como animaciones sutiles y unificar el estilo de los modales.

## Licencia

Este proyecto está bajo la licencia [MIT](LICENSE). <!-- O la licencia que corresponda -->

---

**Compr-As** - Simplificando tus compras.