# Compr-As: Tu Lista de Compras Inteligente

**Compr-As** es una PWA (Progressive Web App) moderna y completa para gestionar tus listas de la compra de forma fácil, rápida y con funciones avanzadas. Olvídate del papel y lleva tus compras al siguiente nivel.

![Captura de pantalla de Compr-As](images/screenshot.png) 

## ✨ Características Principales

*   **🛒 Gestión Completa:** Añade, edita, elimina y marca productos como comprados con un solo clic.
*   **🗂️ Organización Total:** Organiza tus productos por categorías y tiendas personalizables.
*   **🎙️ Entrada por Voz:** Añade productos rápidamente usando tu voz.
*   **🧠 Autocompletado Inteligente:** El sistema aprende de los productos que añades para sugerírtelos en el futuro.
*   **🔍 Búsqueda y Filtrado:** Encuentra cualquier producto al instante y filtra tu lista por tienda o prioridad.
*   **⇅ Orden Dinámico:** Ordena tu lista por nombre, categoría o coste para visualizarla como prefieras.
*   **🔄 Importa y Exporta:**
    *   Exporta tu lista de compras a formatos `.txt`, `.jpg` o `.pdf`.
    *   Importa listas desde archivos `.txt`, con un sistema de previsualización para asegurar que los datos son correctos.
*   **📱 Diseño Adaptable (Responsive):** Interfaz clara y fácil de usar en cualquier dispositivo, ya sea móvil, tablet o escritorio.
*   **🌐 Funcionalidad Offline:** Gracias a que es una PWA, puedes usar la aplicación incluso sin conexión a internet.
*   **⚙️ Personalización:** Ajusta el tamaño del texto para una mejor accesibilidad.

## 🚀 Cómo Empezar

Este proyecto utiliza **Vite** para un desarrollo rápido y moderno.

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/compr-as.git
    cd compr-as
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Inicia el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    ¡Y listo! La aplicación estará disponible en `http://localhost:5173` (o el puerto que indique Vite).

## 🛠️ Scripts Disponibles

*   `npm run dev`: Inicia el servidor de desarrollo con Vite.
*   `npm run build`: Compila y optimiza la aplicación para producción.
*   `npm run test`: Ejecuta los tests unitarios con Vitest.

## 🏗️ Estructura del Proyecto

```
/
├── public/
│   ├── images/       # Iconos y assets de la PWA
│   └── ...
├── src/
│   ├── js/           # Módulos de JavaScript (lógica de la app)
│   │   ├── api.js
│   │   ├── dom.js
│   │   ├── events.js
│   │   ├── render.js
│   │   ├── state.js
│   │   └── utils.js
│   ├── libs/         # Librerías de terceros (Bootstrap, jsPDF)
│   ├── app.js        # Punto de entrada principal de JS
│   ├── index.html    # Estructura principal de la aplicación
│   ├── style.css     # Estilos personalizados
│   └── ...
├── .gitignore
├── package.json
└── README.md
```

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Si tienes ideas para mejorar la aplicación, por favor abre un *issue* para discutirlo o envía un *pull request*.
