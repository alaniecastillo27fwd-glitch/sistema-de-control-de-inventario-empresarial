# Changelog - Historial de Versiones

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/), y este proyecto se adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [0.3.0] - 2026-09-03

### Añadido
- Servidor de base de datos REST simulado con `json-server` operando en el puerto `5000` con persistencia en `db.json`.
- Módulo de integración `src/services/inventoryService.js` con métodos asíncronos (`getProducts`, `addProduct`, `updateProduct`, `updateProductStock`, `deleteProduct`, `getMovements`, `registerMovement`).
- Normalizadores de datos (`normalizeProduct` y `normalizeMovement`) para asegurar compatibilidad bidireccional entre la API y el estado de la aplicación React.
- Historial cronológico de movimientos registrado y persistido en la colección `movements`.
- Banner interactivo de alerta en caso de desconexión del servidor REST con botón de reintento en tiempo real.
- Script `"server": "json-server db.json --port 5000"` incorporado en `package.json`.

### Modificado
- Refactorización de `src/hooks/useInventory.js` para consumir la API de forma asíncrona mediante `Promise.all` y `async/await`.
- Sincronización inmediata entre la actualización de stock en el producto y el registro del movimiento de auditoría.

### Corregido
- Prevención de desalineación de identificadores garantizando el manejo de IDs como cadenas de texto consistentes entre backend y frontend.

---

## [0.2.0] - 2026-09-02

### Añadido
- Componente modal `StockMovementModal.jsx` para el registro asistido de Entradas (`IN`) y Salidas (`OUT`) de mercadería.
- Validación estricta en tiempo real para evitar números negativos o valores decimales no enteros en las cantidades.
- Validación estricta contra inventario negativo en movimientos de salida, alertando con el mensaje exacto: *"Stock insuficiente: solo tienes X unidades disponibles"*.
- Cálculo y proyección visual del stock resultante en tiempo real antes de efectuar la confirmación del movimiento.
- Botones de selección rápida (chips) para motivos comunes (*Compra a proveedor, Venta directa, Merma / Rotura, Caducidad, Devolución*).
- Deshabilitación preventiva del botón de confirmación mientras existan errores en el formulario.

### Modificado
- Integración en `InventoryTable.jsx` de acciones rápidas para abrir el modal de entrada o salida por cada producto.
- Actualización reactiva de las tarjetas de métricas en `DashboardStats.jsx` al ejecutarse cualquier movimiento.

---

## [0.1.0] - 2026-09-01

### Añadido
- Configuración inicial del proyecto con Vite, React 19 y linter Oxlint.
- Sistema de diseño y tokens CSS con paleta dark luxury en `src/index.css`, tipografías modernas de Google Fonts (*Plus Jakarta Sans* y *Space Grotesk*), glassmorphism y microanimaciones.
- Estructura modular base:
  - `Navbar.jsx`: Barra de navegación con indicador de estado general y accesos directos.
  - `DashboardStats.jsx`: Tarjetas interactivas de KPIs (*Total Productos, Unidades Totales, Stock Bajo, Agotados*).
  - `InventoryTable.jsx`: Tabla responsiva con buscador textual, filtrado por categorías y badges de estado dinámicos (*Óptimo, Stock Bajo, Agotado*).
  - `ProductFormModal.jsx`: Formulario modal para alta y edición de productos con soporte para categorías personalizadas.
- Hook centralizado `useInventory.js` con cálculo automático de estadísticas y soporte para catálogo inicial de demostración (`src/data/initialProducts.js`).
