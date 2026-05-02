const BASE = '/api'

async function get(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export const api = {
  // Events
  getEvents: (params = '') => get(`/events${params}`),
  getEvent: (id) => get(`/events/${id}`),
  getEventMatches: (id) => get(`/events/${id}/matches`),
  getEventViewership: (id) => get(`/events/${id}/viewership`),
  getEventTickets: (id) => get(`/events/${id}/tickets`),

  // Collections
  getAllMatches: () => get('/matches'),
  getAllViewership: () => get('/viewership'),
  getAllTickets: () => get('/tickets'),

  // Wrestlers
  getWrestlers: (company = '') =>
    get(`/wrestlers${company ? `?company=${company}` : ''}`),
  getTopMerch: (eventId = '') =>
    get(`/wrestlers/top-merch${eventId ? `?event_id=${eventId}` : ''}`),

  // Analysis
  compare: (eventIds) => get(`/compare?events=${eventIds.join(',')}`),
  getSummary: (company = '') =>
    get(`/summary${company ? `?company=${company}` : ''}`),
}
