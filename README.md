# StockFlow Pro - Sistema de Control de Inventario Empresarial

Sistema web moderno y reactivo para la administración, control y auditoría de existencias e inventario en tiempo real para pequeños negocios, cafeterías, tiendas y comercios locales.

---

## Características Principales

- **Dashboard de Métricas en Tiempo Real (KPIs)**:
  - Total de productos registrados en catálogo.
  - Unidades totales acumuladas y estimación del valor monetario total del inventario.
  - Alerta inmediata de productos con **Stock Bajo** (menor o igual al mínimo requerido).
  - Alerta crítica de productos **Agotados** (0 existencias).
  - Filtro interactivo al hacer clic en cualquiera de las tarjetas de métricas.

- **Control Estricto de Movimientos de Stock (Entradas y Salidas)**:
  - **Entradas (`IN`)**: Registro de compras a proveedores, devoluciones o ajustes al inventario.
  - **Salidas (`OUT`)**: Registro de ventas o mermas con **validación estricta que previene existencias negativas** (*"Stock insuficiente: solo tienes X unidades disponibles"*).
  - Selección rápida de motivos recurrentes (*Compra a proveedor, Venta directa, Merma / Rotura, Caducidad, etc.*).
  - Proyección numérica visual del nuevo stock antes de confirmar el movimiento.

- **Gestión Completa de Catálogo (CRUD)**:
  - Registro de nuevos productos con validación de datos (nombre, categoría, stock inicial, stock mínimo y precio unitario).
  - Edición de información de productos existentes.
  - Eliminación con confirmación de seguridad.
  - Soporte para categorías personalizadas sobre la marcha.

- **Tabla Interactiva de Existencias**:
  - Búsqueda en tiempo real por nombre de producto o categoría.
  - Filtros combinados por estado (*Todos, Óptimo, Stock Bajo, Agotado*) y por categoría específica.
  - Badges de estado dinámicos (*Óptimo, Stock Bajo, Agotado*).

- **Historial de Auditoría**:
  - Registro cronológico detallado de todos los movimientos realizados en la base de datos local con fecha, producto, cantidad, motivo y stock resultante.

- **Persistencia con API REST**:
  - Conexión asíncrona (`fetch` con `async/await`) con un backend simulado mediante `json-server` (`http://localhost:5000/products` y `http://localhost:5000/movements`).

---

## Tecnologías Utilizadas

- **Frontend**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Linter**: [Oxlint](https://oxc.rs/)
- **Backend / Persistencia**: [JSON Server](https://github.com/typicode/json-server) (API REST local en `db.json`)
- **Estilos**: Vanilla CSS con variables de diseño, glassmorphism, microanimaciones y paleta de colores profesional dark luxury.

---

## Estructura del Proyecto

```text
sistema-de-control-de-inventario-empresarial/
├── db.json                      # Base de datos local (colecciones products y movements)
├── index.html                   # Documento HTML principal con fuentes de Google y favicon
├── package.json                 # Dependencias y scripts del proyecto
├── vite.config.js               # Configuración del bundler Vite
├── .oxlintrc.json               # Reglas y configuración del linter Oxlint
├── public/
│   ├── favicon.svg              # Favicon SVG de la aplicación
│   └── icons.svg                # Iconos auxiliares SVG
└── src/
    ├── main.jsx                 # Punto de entrada de React (StrictMode)
    ├── App.jsx                  # Componente contenedor y gestor de modales/toasts
    ├── index.css                # Sistema de diseño, tokens, variables y estilos responsivos
    ├── components/
    │   ├── Navbar.jsx           # Barra superior con estado de inventario y acciones
    │   ├── DashboardStats.jsx   # Métricas y tarjetas de resumen KPI
    │   ├── InventoryTable.jsx   # Tabla de productos con filtros y buscador
    │   ├── ProductFormModal.jsx # Modal de alta y edición de productos
    │   └── StockMovementModal.jsx # Modal de entradas y salidas de stock
    ├── hooks/
    │   └── useInventory.js      # Hook personalizado central con estado reactivo y llamadas a API
    ├── services/
    │   └── inventoryService.js  # Capa de peticiones HTTP (GET, POST, PATCH, DELETE)
    └── data/
        └── initialProducts.js   # Catálogo inicial y categorías base de demostración
```

---

## Instalación y Ejecución Local

### 1. Requisitos
- Node.js (versión 18 o superior recomendada).
- npm (o pnpm / yarn).

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el Servidor de la API REST (`json-server`)
En una terminal, inicia el servidor backend local que almacena los datos en `db.json`:
```bash
npm run server
```
> La API quedará escuchando en `http://localhost:5000`.

### 4. Iniciar la Aplicación Frontend (`Vite`)
En otra terminal (o pestaña separada), inicia el servidor de desarrollo:
```bash
npm run dev
```
> Abre tu navegador en la URL indicada por Vite (normalmente `http://localhost:5173`).

---

## Endpoints de la API REST (`json-server`)

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/products` | Obtiene todos los productos registrados. |
| `POST` | `/products` | Crea un nuevo producto. |
| `PATCH` | `/products/:id` | Actualiza atributos o stock de un producto. |
| `DELETE` | `/products/:id` | Elimina un producto del inventario. |
| `GET` | `/movements` | Lista el historial de movimientos de inventario. |
| `POST` | `/movements` | Registra una nueva entrada o salida. |

---

## Validación y Calidad de Código

- Para compilar el proyecto para producción:
  ```bash
  npm run build
  ```
- Para ejecutar el análisis estático de código:
  ```bash
  npm run lint
  ```
