# Dashboard Analítico de Wrestling

Desarrollé una aplicación fullstack para visualización y comparación de métricas entre WWE y AEW utilizando React y Node.js. El proyecto incluye renderizado dinámico de datos, diseño responsive y una interfaz enfocada en experiencia de usuario y análisis visual.

Dashboard comparativo de wrestling orientado al análisis de eventos WrestleMania (WWE) y All In (AEW) entre 2023 y 2026, permitiendo visualizar y contrastar métricas relevantes mediante gráficos, organización estructurada de datos e interfaces dinámicas enfocadas en exploración y lectura de información.


- Demo en producción: https://dashboard-comparativo-wwe-aew.vercel.app/ (frontend en Vercel, backend en Northflank)

- Métricas económicas (attendance, gate, revenue estimado, tickets)
- Audiencia y contexto de plataformas (Peacock, Netflix, TNT/TBS, Max)
- Rankings de merch por luchador y evento
- Nivel de confianza de cada dato (`confirmed`, `estimated`, `no_data`)

El proyecto está dividido en:

- **Backend**: API REST en Express con datos en JSON local
- **Frontend**: React + Vite + Tailwind CSS v4 + Recharts

## Tabla de contenidos

1. [Objetivo](#objetivo)
2. [Características](#características)
3. [Stack técnico](#stack-técnico)
4. [Arquitectura del proyecto](#arquitectura-del-proyecto)
5. [Instalación y ejecución local](#instalación-y-ejecución-local)
6. [Scripts disponibles](#scripts-disponibles)
7. [API REST](#api-rest)
8. [Modelo de datos](#modelo-de-datos)
9. [Frontend: secciones y comportamiento](#frontend-secciones-y-comportamiento)
10. [Flujo de trabajo para actualizar datos](#flujo-de-trabajo-para-actualizar-datos)
11. [Despliegue](#despliegue)
12. [Troubleshooting](#troubleshooting)
13. [Mejoras recomendadas](#mejoras-recomendadas)

## Objetivo

Construir una visualización clara y práctica para comparar el rendimiento de los eventos principales de WWE y AEW, combinando datos **confirmados** y **estimados** en una sola interfaz.

## Características

- Comparativa WWE vs AEW en una vista principal (Hero KPI cards)
- Sección económica con:
  - Gráfico de barras Gate vs Revenue estimado
  - Gráfico de asistencia por evento
  - Tabla detallada por evento
  - Desglose de tickets por categoría con pie chart
- Sección de audiencia con:
  - Peak viewers históricos
  - Nota metodológica de comparabilidad (Netflix vs Nielsen)
  - Tarjetas por evento con gráfico de contexto temporal
- Sección de luchadores con:
  - Top merch por evento
  - Spotlight del top vendedor
  - Tabla completa de luchadores y rankings
- Modo tema persistente (`dark` / `light`) guardado en `localStorage`
- API con filtros por query params
- Health endpoint para descubrimiento rápido de rutas
- Headers de seguridad con `helmet` y rate limiting (300 req / 15 min / IP) con `express-rate-limit`

## Stack técnico

### Backend

- Node.js `>=18`
- Express 4
- CORS
- Helmet (headers de seguridad)
- express-rate-limit (300 req / 15 min / IP)
- Datos estáticos en archivos JSON
- Nodemon para desarrollo

### Frontend

- React 19
- Vite 8
- Tailwind CSS v4 (plugin oficial de Vite)
- Recharts para gráficos

## Arquitectura del proyecto

```text
wwe-aew-dashboard/
├── package.json                 # Scripts de orquestación simples
├── README.md
├── backend/
│   ├── package.json
│   ├── data/
│   │   ├── events.json
│   │   ├── matches.json
│   │   ├── tickets.json
│   │   ├── viewership.json
│   │   └── wrestlers.json
│   └── src/
│       └── index.js            # API REST completa
└── frontend/
    ├── package.json
    ├── vite.config.js          # Proxy /api -> localhost:3001
    ├── src/
    │   ├── api/wrestling.js
    │   ├── components/
    │   ├── sections/
    │   ├── App.jsx
    │   └── index.css
    └── public/
```

## Instalación y ejecución local

### 1) Requisitos

- Node.js 18 o superior
- npm 9+ recomendado

### 2) Instalar dependencias

Desde la raíz del proyecto:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3) Ejecutar en desarrollo

Opción A (dos terminales, recomendado):

```bash
# Terminal 1
cd backend
npm run dev
```

```bash
# Terminal 2
cd frontend
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

El frontend usa proxy de Vite, así que consume `'/api'` sin configurar CORS adicional en cliente.

### 4) Verificar salud de la API

```bash
curl http://localhost:3001/api/health
```

## Scripts disponibles

### Raíz (`/package.json`)

- `npm run backend`: entra a `backend` y ejecuta modo dev
- `npm run frontend`: entra a `frontend` y ejecuta modo dev
- `npm run start:backend`: arranca backend en modo start

### Backend (`/backend/package.json`)

- `npm run dev`: inicia con nodemon
- `npm run start`: inicia con node

### Frontend (`/frontend/package.json`)

- `npm run dev`: servidor Vite
- `npm run build`: build producción
- `npm run preview`: preview del build
- `npm run lint`: lint del frontend

## API REST

Base URL local: `http://localhost:3001/api`

### Convenciones de respuesta

- Éxito colección:

```json
{ "data": [], "total": 0 }
```

- Éxito recurso único:

```json
{ "data": {} }
```

- Error:

```json
{ "error": "Mensaje descriptivo" }
```

### Endpoints

| Método | Endpoint | Descripción | Query params |
|---|---|---|---|
| GET | `/events` | Lista de eventos | `company`, `year` |
| GET | `/events/:id` | Detalle de evento | - |
| GET | `/events/:id/matches` | Peleas del evento | - |
| GET | `/matches` | Todas las peleas | `event_id`, `is_main_event` |
| GET | `/events/:id/viewership` | Viewership por evento | - |
| GET | `/viewership` | Todos los registros de audiencia | - |
| GET | `/events/:id/tickets` | Tickets por evento | - |
| GET | `/tickets` | Tickets de todos los eventos | - |
| GET | `/wrestlers` | Luchadores | `company` |
| GET | `/wrestlers/top-merch` | Ranking de merch | `event_id` |
| GET | `/wrestlers/:id` | Detalle de luchador | - |
| GET | `/compare` | Comparativa multi-evento | `events=wm40,allin23` |
| GET | `/summary` | Resumen agregado | `company` |
| GET | `/health` | Estado + listado de endpoints | - |

### Ejemplos rápidos

```bash
# Eventos WWE de 2025
curl "http://localhost:3001/api/events?company=WWE&year=2025"

# Main events de WM40
curl "http://localhost:3001/api/matches?event_id=wm40&is_main_event=true"

# Comparar 2 eventos
curl "http://localhost:3001/api/compare?events=wm40,allin23"

# Resumen AEW
curl "http://localhost:3001/api/summary?company=AEW"
```

## Modelo de datos

Los datos están en `backend/data/*.json`.

### 1) `events.json`

Entidad principal de cada evento:

- Identificación: `id`, `name`, `company`, `year`, `edition`
- Venue: `venue`, `city`, `country`, `capacity`, `dates`, `nights`
- Economía: `attendance`, `occupancy_pct`, `gate_usd`, `total_revenue_est_usd`
- Contexto plataforma: `platform`, `platform_region`, `international_platform`
- Metadatos: `*_confidence`, `*_source`, `notes`

### 2) `tickets.json`

Desglose comercial por evento:

- `currency` y opcional `currency_usd_rate`
- `sellout`, `avg_ticket_price_est`
- `categories[]` con:
  - tramo de precios (`price_face_min`, `price_face_max`)
  - reventa estimada (`price_resale_avg`)
  - peso en mix (`pct_of_total`)
  - color visual (`color_hex`)

### 3) `viewership.json`

Métricas de audiencia:

- `peak_viewers` (cuando hay dato)
- `demo_rating_18_49` (cuando aplica)
- contextos temporales (`weekly_context`, `weekly_dynamite_context`, `monthly_raw_netflix`)
- notas metodológicas de comparabilidad entre plataformas

### 4) `matches.json`

Cartelera por evento:

- ordenado por `night` + `order`
- participantes, resultado, método, `is_main_event`

### 5) `wrestlers.json`

Perfil comercial/deportivo:

- información base (`name`, `company`, `active_years`)
- `merch_ranking[]` por evento
- `appearances[]` vinculadas a `match_id`
- `merch_items[]` y notas cualitativas

### Niveles de confianza

- `confirmed`: dato confirmado por fuente oficial/auditable
- `estimated`: estimación sustentada por prensa/industry reports
- `no_data`: evento fuera de corte o sin publicación fiable

## Frontend: secciones y comportamiento

### Hero

- Consume `GET /summary?company=WWE` y `GET /summary?company=AEW`
- Muestra KPIs agregados lado a lado

### Análisis Económico

- Consume `GET /events` y `GET /events/:id/tickets`
- Muestra gráficos de gate/revenue y asistencia
- Incluye tabla detallada y breakdown de tickets

### Audiencia & Viewership

- Consume `GET /viewership` + `GET /events`
- Muestra picos históricos y cards por evento
- Incluye nota metodológica (Netflix vs Nielsen)

### Luchadores & Merch

- Consume `GET /wrestlers/top-merch` + `GET /wrestlers`
- Permite filtrar por evento y ver ranking de top sellers

## Flujo de trabajo para actualizar datos

1. Editar JSON en `backend/data`.
2. Mantener IDs consistentes entre entidades:
   - `events.id`
   - `tickets.event_id`
   - `viewership.event_id`
   - `matches.event_id`
   - `wrestlers.merch_ranking[].event_id`
3. Si se agrega un nuevo evento:
   - agregar registro en `events.json`
   - agregar (o stub con `no_data`) en `tickets.json` y `viewership.json`
   - opcional: cartelera en `matches.json`
   - opcional: rankings en `wrestlers.json`
4. Reiniciar backend para limpiar caché de `require` de JSON en desarrollo.
5. Validar en frontend que aparezca en gráficos/tablas y no rompa el orden esperado.

## Despliegue

### Backend

- **Producción actual: Northflank** (`https://site--wrestling-api--qd6hnmpb5l7w.code.run`)
- Hubo un despliegue anterior en Railway que quedó abandonado (build roto, sin variables configuradas) — ignorarlo, no es el backend en uso.
- Otras plataformas compatibles: Render, Fly.io, VPS
- Exponer puerto por `PORT` (ya soportado)
- Comando: `npm run start`
- Setear `CORS_ORIGIN` con la URL exacta del frontend en Vercel (sin esto, cae al default `*`).
  Actualmente solo soporta un único origin, no una lista separada por comas.

### Frontend

- Plataformas sugeridas: Vercel, Netlify, Cloudflare Pages
- Build command: `npm run build`
- Output dir: `dist`
- Configurar variable/proxy si backend va en dominio distinto

## Troubleshooting

### El frontend no carga datos

- Verificar backend activo en `localhost:3001`
- Verificar `GET /api/health`
- Revisar que el proxy de Vite esté apuntando a `http://localhost:3001`

### Cambié JSON y no veo cambios

- Reiniciar backend (`npm run dev`)
- Hard refresh del navegador

### Error 404 en endpoint

- Revisar rutas disponibles en `GET /api/health`
- Confirmar `id` existente (`wm40`, `wm41`, `allin23`, etc.)

### CORS

- El backend ya usa `cors()`
- En desarrollo frontend usa proxy, por lo que normalmente no debería fallar

## Mejoras recomendadas

- Añadir validación de esquema JSON (Zod/Ajv)
- Agregar tests (API + componentes)
- Mover `loadData` a lectura con `fs` para evitar caché de `require`
- Documentar OpenAPI/Swagger
- Agregar filtros avanzados y comparador dinámico en UI
- Soportar múltiples orígenes en `CORS_ORIGIN` (separados por coma)


---


