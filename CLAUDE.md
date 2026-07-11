# CLAUDE.md

Este archivo proporciona guía a Claude Code (claude.ai/code) cuando trabaja con código en este repositorio.

## Comandos

Ejecutar desde la raíz del repo; backend y frontend son proyectos npm independientes con sus propias dependencias.

```bash
# Instalar
cd backend && npm install
cd frontend && npm install

# Desarrollo (dos terminales)
npm run backend    # desde la raíz: backend en http://localhost:3001 (nodemon)
npm run frontend   # desde la raíz: frontend en http://localhost:5173 (Vite, hace proxy de /api -> :3001)

# Solo backend
cd backend && npm run start   # node, sin watch

# Solo frontend
cd frontend && npm run build    # build de producción a dist/
cd frontend && npm run preview  # preview del build
cd frontend && npm run lint     # eslint

# Health check
curl http://localhost:3001/api/health
```

No existe suite de tests en ninguno de los dos paquetes (`npm test` no está definido).

## Arquitectura

Dos aplicaciones independientes, sin paquete compartido: `backend/` (Express) y `frontend/` (React + Vite). Sin base de datos — el backend es una capa REST de solo lectura sobre archivos JSON estáticos.

### Backend (`backend/src/index.js`, archivo único, ~340 líneas)

- Todas las rutas y el helper `loadData()` viven en este único archivo. `loadData(filename)` hace `require(path.join(__dirname, '..', 'data', filename))` — los nombres de archivo siempre son literales hardcodeados en los handlers de las rutas, nunca derivados del input de la request.
- Los datos viven en `backend/data/*.json`: `events.json`, `matches.json`, `tickets.json`, `viewership.json`, `wrestlers.json`. El filtrado/join entre estos archivos ocurre en memoria dentro de los handlers de las rutas (p. ej. `/api/compare` combina events + tickets + viewership por id de evento).
- Convención de forma de respuesta: las colecciones devuelven `{ data: [], total: N }`, los recursos únicos devuelven `{ data: {} }`, los errores devuelven `{ error: "..." }`.
- El orden de los middlewares importa: `helmet()` → `cors()` → `express-rate-limit` (300 req/15min) → `express.json()`.
- **Variable de entorno `CORS_ORIGIN`**: por defecto es `*` si no está seteada. Debe setearse con el origin exacto del frontend en cualquier despliegue real.
- **El backend de producción corre en Northflank** (`https://site--wrestling-api--qd6hnmpb5l7w.code.run`), no en Railway — existe un despliegue viejo en Railway pero está abandonado (build roto, sin variables de entorno configuradas). No asumir que Railway está activo.

### Frontend (`frontend/src/`)

- `api/wrestling.js` — un único wrapper de fetch, `BASE = import.meta.env.VITE_API_URL ?? '/api'`. En desarrollo esto se resuelve a través del proxy de Vite en `vite.config.js`; en producción (Vercel) `VITE_API_URL` debe apuntar al backend de Northflank y queda incluida en el build (no es un secret en runtime, aunque en Vercel esté marcada como "Sensitive").
- `sections/` — un componente por sección del dashboard (Hero, Economic, Viewership, Wrestlers), cada uno responsable de obtener y renderizar su propia porción de la API.
- `components/` — piezas presentacionales pequeñas y compartidas (`KpiCard`, `ConfidenceBadge`, `SectionHeader`).
- La confianza del dato es un concepto de primera clase de punta a punta: los registros llevan campos `*_confidence` (`confirmed` / `estimated` / `no_data`) y `*_source` desde el JSON de datos hasta la respuesta de la API; el frontend lo renderiza vía `ConfidenceBadge` en lugar de tratar todos los números como igualmente confiables.
- El tema (`dark`/`light`) persiste en `localStorage`.

### Agregar un evento nuevo

Documentado en el README bajo "Flujo de trabajo para actualizar datos": agregar a `events.json`, luego completar o dejar como stub `tickets.json` y `viewership.json` (usar confianza `no_data` si no se sabe), opcionalmente `matches.json` y `wrestlers.json`. Reiniciar el backend en desarrollo — `require()` cachea el JSON y no toma los cambios si no se reinicia.
