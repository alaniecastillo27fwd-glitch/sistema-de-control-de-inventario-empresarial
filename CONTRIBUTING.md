# Guía de Contribución - StockFlow Pro

¡Te damos la bienvenida al proyecto **StockFlow Pro (Sistema de Control de Inventario Empresarial)**!  
Este documento establece los estándares de desarrollo, arquitectura y buenas prácticas bajo la metodología de **Vibe Coding** para garantizar la calidad, escalabilidad y mantenibilidad del software.

---

## 💡 Filosofía: Metodología Vibe Coding

En este proyecto adoptamos el enfoque de **Vibe Coding** (desarrollo ágil asistido por Inteligencia Artificial y herramientas de nueva generación). Para colaborar eficazmente, sigue estas premisas fundamentales:

1. **Prompting Contextualizado e Iterativo**:
   - En lugar de solicitar funcionalidades masivas en un único prompt, desglosa los requerimientos en micro-tareas específicas (ej. un componente, un endpoint de servicio, o una validación de formulario).
   - Proporciona a la IA contexto claro del negocio, reglas de dominio y restricciones técnicas (ej. *"no permitir números negativos"*, *"usar solo Vanilla CSS con variables"*).

2. **Principio "Trust but Verify" (Confía pero Verifica)**:
   - Todo código generado por IA debe ser revisado minuciosamente por el desarrollador antes de integrarse.
   - Realiza pruebas manuales de usabilidad en el navegador y comprueba la lógica de bordes (edge cases).

3. **Garantía de Calidad Continua**:
   - Ejecuta obligatoriamente el análisis estático (`npm run lint`) y la compilación (`npm run build`) tras cada iteración asistida por IA.
   - Registra cada ciclo de prompting y corrección en la [BITACORA_PROMPTS.md](file:///c:/Users/Estudiantes/Desktop/sistema-de-control-de-inventario-empresarial/BITACORA_PROMPTS.md).

---

## 🏛️ Convenciones de Arquitectura y Código (React)

El proyecto implementa una arquitectura desacoplada y orientada a capas:

```text
src/
├── components/   # Componentes de interfaz (UI) puros y reutilizables
├── hooks/        # Hooks personalizados con estado y lógica de negocio
├── services/     # Capa de consumo de APIs REST y persistencia asíncrona
└── data/         # Esquemas base, constantes y catálogos estáticos
```

### 1. Componentes de UI (`src/components/`)
- Deben ser componentes funcionales centrados en la presentación e interacción.
- Se comunican con el estado global/padre exclusivamente mediante **Props** y callbacks tipados (`onSubmit`, `onClose`, `onDelete`).
- No deben realizar llamadas directas a `fetch` ni contener lógica de red; deben delegar estas acciones en hooks o funciones pasadas por props.
- Los estilos visuales deben consumir las variables semánticas definidas en `src/index.css` (tokens de espaciado, colores HSL, bordes y sombras).

### 2. Custom Hooks (`src/hooks/`)
- Centralizan el estado reactivo (`useState`, `useMemo`, `useCallback`) y la sincronización con servicios.
- Todo cálculo derivado (como contadores de alertas, métricas financieras o listas de categorías únicas) debe optimizarse con `useMemo`.
- Las funciones asíncronas deben manejar estados de carga (`loading`), error (`error`) y respuestas estructuradas (`{ success: boolean, ... }`).

### 3. Capa de Servicios (`src/services/`)
- Módulos con funciones asíncronas puras utilizando `fetch` y `async/await`.
- Deben incluir funciones de normalización bidireccional de datos (`normalizeProduct`, `normalizeMovement`) para asegurar compatibilidad entre la base de datos (ej. propiedades en español de `db.json`) y los componentes de React.
- Manejo explícito de excepciones y códigos de estado HTTP con mensajes de error descriptivos.

---

## 🌿 Flujo de Trabajo en Git

Adoptamos un flujo ágil basado en ramas de características (*Feature Branching*):

1. **Ramas Principales**:
   - `main`: Rama de producción. Debe mantenerse siempre estable y desplegable.
   - `develop` (o ramas base): Integración de funcionalidades validadas.

2. **Ramas de Trabajo**:
   - Nuevas funcionalidades: `feat/nombre-funcionalidad` (ej. `feat/export-csv-reports`)
   - Corrección de bugs: `fix/nombre-del-error` (ej. `fix/modal-closing-backdrop`)
   - Documentación: `docs/tema-actualizado` (ej. `docs/vibe-coding-guide`)
   - Refactorización / Estilos: `refactor/area-optimizada` o `style/ajuste-visual`

---

## 📝 Estándar de Commits (Conventional Commits)

Todos los commits deben redactarse en tiempo imperativo y seguir la especificación [Conventional Commits](https://www.conventionalcommits.org/):

```text
<tipo>(<alcance opcional>): <descripción breve y concisa>
```

### Tipos permitidos:
- `feat`: Nueva característica para el usuario final (ej. `feat(movements): agregar exportación a PDF`).
- `fix`: Corrección de un fallo o error en el sistema (ej. `fix(validation): evitar cantidades en 0 en salidas`).
- `docs`: Modificaciones exclusivas en documentación (ej. `docs: actualizar bitacora de prompts`).
- `style`: Cambios de formato, identación o CSS que no alteran la lógica de negocio.
- `refactor`: Cambios de código que no corrigen errores ni agregan funcionalidades.
- `test`: Adición o corrección de pruebas unitarias o de integración.
- `chore`: Tareas de mantenimiento, actualización de dependencias o scripts en `package.json`.

---

## ✅ Checklist de Control de Calidad previo a Pull Request

Antes de enviar un Pull Request o fusionar una rama en `main`, verifica:

- [ ] La base de datos local responde adecuadamente en `http://localhost:5000`.
- [ ] No existen errores de compilación ejecutando `npm run build`.
- [ ] El linter no emite errores al correr `npm run lint`.
- [ ] La interfaz se adapta correctamente a resoluciones móviles y de escritorio.
- [ ] Se han documentado las iteraciones y correcciones en `BITACORA_PROMPTS.md`.
- [ ] Se ha actualizado `CHANGELOG.md` si la contribución implica un cambio de versión.
