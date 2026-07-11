const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

app.set('trust proxy', 1)

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
}))
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
}))
app.use(express.json())

// ─── Helpers ─────────────────────────────────────────────────────────────────
// Carga un archivo JSON desde /data de forma segura
function loadData(filename) {
  return require(path.join(__dirname, '..', 'data', filename))
}

// ─── Routes: Events ──────────────────────────────────────────────────────────

// GET /api/events
// Devuelve todos los eventos. Acepta ?company=WWE|AEW y ?year=2024
app.get('/api/events', (req, res) => {
  let events = loadData('events.json')
  const { company, year } = req.query

  if (company) {
    events = events.filter(e => e.company.toUpperCase() === company.toUpperCase())
  }
  if (year) {
    events = events.filter(e => e.year === parseInt(year))
  }

  res.json({ data: events, total: events.length })
})

// GET /api/events/:id
// Devuelve el detalle completo de un evento por su id (ej: wm40, allin23)
app.get('/api/events/:id', (req, res) => {
  const events = loadData('events.json')
  const event = events.find(e => e.id === req.params.id)

  if (!event) {
    return res.status(404).json({ error: `Evento '${req.params.id}' no encontrado` })
  }

  res.json({ data: event })
})

// ─── Routes: Matches ─────────────────────────────────────────────────────────

// GET /api/events/:id/matches
// Devuelve las peleas de un evento específico
app.get('/api/events/:id/matches', (req, res) => {
  const matches = loadData('matches.json')
  const eventMatches = matches.filter(m => m.event_id === req.params.id)

  if (eventMatches.length === 0) {
    return res.status(404).json({ error: `No hay peleas registradas para el evento '${req.params.id}'` })
  }

  // Ordena por noche y luego por orden dentro de la noche
  const sorted = eventMatches.sort((a, b) => {
    if (a.night !== b.night) return a.night - b.night
    return a.order - b.order
  })

  res.json({ data: sorted, total: sorted.length })
})

// GET /api/matches
// Devuelve todas las peleas. Acepta ?event_id=wm40 y ?is_main_event=true
app.get('/api/matches', (req, res) => {
  let matches = loadData('matches.json')
  const { event_id, is_main_event } = req.query

  if (event_id) {
    matches = matches.filter(m => m.event_id === event_id)
  }
  if (is_main_event !== undefined) {
    const flag = is_main_event === 'true'
    matches = matches.filter(m => m.is_main_event === flag)
  }

  res.json({ data: matches, total: matches.length })
})

// ─── Routes: Viewership ──────────────────────────────────────────────────────

// GET /api/events/:id/viewership
// Devuelve los datos de audiencia de un evento
app.get('/api/events/:id/viewership', (req, res) => {
  const viewership = loadData('viewership.json')
  const data = viewership.find(v => v.event_id === req.params.id)

  if (!data) {
    return res.status(404).json({ error: `No hay datos de viewership para el evento '${req.params.id}'` })
  }

  res.json({ data })
})

// GET /api/viewership
// Devuelve todos los datos de audiencia con un resumen de confianza
app.get('/api/viewership', (req, res) => {
  const viewership = loadData('viewership.json')

  // Añade un campo has_data para que el frontend sepa si mostrar el dato o un placeholder
  const enriched = viewership.map(v => ({
    ...v,
    has_data: v.peak_viewers !== null
  }))

  res.json({ data: enriched, total: enriched.length })
})

// ─── Routes: Tickets ─────────────────────────────────────────────────────────

// GET /api/events/:id/tickets
// Devuelve los datos de tickets de un evento
app.get('/api/events/:id/tickets', (req, res) => {
  const tickets = loadData('tickets.json')
  const data = tickets.find(t => t.event_id === req.params.id)

  if (!data) {
    return res.status(404).json({ error: `No hay datos de tickets para el evento '${req.params.id}'` })
  }

  res.json({ data })
})

// GET /api/tickets
// Devuelve los datos de todos los eventos
app.get('/api/tickets', (req, res) => {
  const tickets = loadData('tickets.json')
  res.json({ data: tickets, total: tickets.length })
})

// ─── Routes: Wrestlers ───────────────────────────────────────────────────────

// GET /api/wrestlers
// Devuelve todos los luchadores. Acepta ?company=WWE|AEW
app.get('/api/wrestlers', (req, res) => {
  let wrestlers = loadData('wrestlers.json')
  const { company } = req.query

  if (company) {
    wrestlers = wrestlers.filter(w => w.company.toUpperCase() === company.toUpperCase())
  }

  res.json({ data: wrestlers, total: wrestlers.length })
})

// GET /api/wrestlers/top-merch
// Devuelve el ranking de merch por evento. Acepta ?event_id=wm40
app.get('/api/wrestlers/top-merch', (req, res) => {
  const wrestlers = loadData('wrestlers.json')
  const { event_id } = req.query

  // Aplana los merch_rankings y filtra por evento si se pide
  let rankings = []

  wrestlers.forEach(wrestler => {
    wrestler.merch_ranking.forEach(mr => {
      if (!event_id || mr.event_id === event_id) {
        rankings.push({
          wrestler_id: wrestler.id,
          name: wrestler.name,
          company: wrestler.company,
          event_id: mr.event_id,
          rank: mr.rank,
          confidence: mr.confidence,
          notes: mr.notes,
          merch_items: wrestler.merch_items
        })
      }
    })
  })

  // Ordena por evento y luego por rank
  rankings.sort((a, b) => {
    if (a.event_id < b.event_id) return -1
    if (a.event_id > b.event_id) return 1
    return a.rank - b.rank
  })

  res.json({ data: rankings, total: rankings.length })
})

// GET /api/wrestlers/:id
// Devuelve el detalle de un luchador
app.get('/api/wrestlers/:id', (req, res) => {
  const wrestlers = loadData('wrestlers.json')
  const wrestler = wrestlers.find(w => w.id === req.params.id)

  if (!wrestler) {
    return res.status(404).json({ error: `Luchador '${req.params.id}' no encontrado` })
  }

  res.json({ data: wrestler })
})

// ─── Routes: Compare ─────────────────────────────────────────────────────────

// GET /api/compare
// Devuelve una comparativa directa de múltiples eventos
// Uso: /api/compare?events=wm40,allin23
app.get('/api/compare', (req, res) => {
  const { events: eventsParam } = req.query

  if (!eventsParam) {
    return res.status(400).json({ error: 'Parámetro events requerido. Ej: ?events=wm40,allin23' })
  }

  const eventIds = eventsParam.split(',').map(id => id.trim())
  const allEvents = loadData('events.json')
  const allTickets = loadData('tickets.json')
  const allViewership = loadData('viewership.json')

  const comparison = eventIds.map(id => {
    const event = allEvents.find(e => e.id === id)
    if (!event) return { id, error: 'Evento no encontrado' }

    const tickets = allTickets.find(t => t.event_id === id)
    const viewership = allViewership.find(v => v.event_id === id)

    return {
      id: event.id,
      name: event.name,
      company: event.company,
      year: event.year,
      // Económicos
      attendance: event.attendance,
      attendance_confidence: event.attendance_confidence,
      occupancy_pct: event.occupancy_pct,
      gate_usd: event.gate_usd,
      gate_confidence: event.gate_confidence,
      total_revenue_est_usd: event.total_revenue_est_usd,
      // Tickets
      avg_ticket_price_est: tickets?.avg_ticket_price_est ?? null,
      sellout: tickets?.sellout ?? null,
      ticket_categories: tickets?.categories ?? [],
      // Audiencia
      peak_viewers: viewership?.peak_viewers ?? null,
      peak_viewers_confidence: viewership?.peak_viewers_confidence ?? 'no_data',
      platform: event.platform,
      demo_rating_18_49: viewership?.demo_rating_18_49 ?? null
    }
  })

  res.json({ data: comparison, total: comparison.length })
})

// ─── Routes: Summary ─────────────────────────────────────────────────────────

// GET /api/summary
// Devuelve un resumen consolidado. Acepta ?company=WWE|AEW
app.get('/api/summary', (req, res) => {
  const { company } = req.query
  let events = loadData('events.json')
  const viewership = loadData('viewership.json')
  const tickets = loadData('tickets.json')

  if (company) {
    events = events.filter(e => e.company.toUpperCase() === company.toUpperCase())
  }

  // Solo eventos con datos reales
  const eventsWithData = events.filter(e => e.attendance !== null)

  const totalAttendance = eventsWithData.reduce((sum, e) => sum + (e.attendance || 0), 0)
  const totalGate = eventsWithData.reduce((sum, e) => sum + (e.gate_usd || 0), 0)
  const totalRevenueEst = eventsWithData.reduce((sum, e) => sum + (e.total_revenue_est_usd || 0), 0)

  const viewershipWithData = viewership.filter(v => {
    const event = events.find(e => e.id === v.event_id)
    return event && v.peak_viewers !== null
  })
  const peakViewership = viewershipWithData.length > 0
    ? Math.max(...viewershipWithData.map(v => v.peak_viewers))
    : null

  const avgOccupancy = eventsWithData.length > 0
    ? eventsWithData.reduce((sum, e) => sum + (e.occupancy_pct || 0), 0) / eventsWithData.length
    : null

  res.json({
    data: {
      company: company || 'ALL',
      events_total: events.length,
      events_with_data: eventsWithData.length,
      events_no_data: events.length - eventsWithData.length,
      total_attendance: totalAttendance,
      total_gate_usd: totalGate,
      total_revenue_est_usd: totalRevenueEst,
      peak_viewership: peakViewership,
      avg_occupancy_pct: avgOccupancy ? Math.round(avgOccupancy * 10) / 10 : null
    }
  })
})

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/events',
      'GET /api/events/:id',
      'GET /api/events/:id/matches',
      'GET /api/events/:id/viewership',
      'GET /api/events/:id/tickets',
      'GET /api/matches',
      'GET /api/viewership',
      'GET /api/tickets',
      'GET /api/wrestlers',
      'GET /api/wrestlers/top-merch',
      'GET /api/wrestlers/:id',
      'GET /api/compare?events=wm40,allin23',
      'GET /api/summary?company=WWE'
    ]
  })
})

// ─── 404 catch-all ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Ruta '${req.path}' no encontrada. Consulta GET /api/health para ver los endpoints disponibles.` })
})

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Wrestling Dashboard API corriendo en http://localhost:${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/api/health`)
})
