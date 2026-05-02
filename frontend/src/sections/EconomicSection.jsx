import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend,
} from 'recharts'
import { api } from '../api/wrestling'
import SectionHeader from '../components/SectionHeader'
import KpiCard from '../components/KpiCard'
import ConfidenceBadge from '../components/ConfidenceBadge'

function fmt(n, opts = {}) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US', opts).format(n)
}
function fmtUSD(n) {
  if (n == null) return '—'
  return `$${new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(n / 1_000_000)}M`
}

const COMPANY_COLOR = { WWE: '#ef4444', AEW: '#f97316' }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-elevated border border-border-s rounded-lg p-3 text-sm">
      <p className="text-dim font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value != null ? fmtUSD(p.value) : '—'}
        </p>
      ))}
    </div>
  )
}

const AttendanceTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-elevated border border-border-s rounded-lg p-3 text-sm">
      <p className="text-dim font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value != null ? fmt(p.value) : '—'}
        </p>
      ))}
    </div>
  )
}

export default function EconomicSection() {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [tickets, setTickets] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getEvents().then((res) => {
      setEvents(res.data)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedEvent) return
    api.getEventTickets(selectedEvent).then((res) => setTickets(res.data))
  }, [selectedEvent])

  const eventsWithData = events.filter((e) => e.gate_usd != null)

  const gateData = eventsWithData.map((e) => ({
    name: e.name.replace('WrestleMania ', 'WM').replace('AEW All In ', 'All In '),
    gate: e.gate_usd,
    revenue: e.total_revenue_est_usd,
    company: e.company,
  }))

  const attendanceData = eventsWithData.map((e) => ({
    name: e.name.replace('WrestleMania ', 'WM').replace('AEW All In ', 'All In '),
    attendance: e.attendance,
    occupancy: e.occupancy_pct,
    company: e.company,
    capacity: e.capacity,
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <section className="px-6 md:px-10 py-16 max-w-7xl mx-auto">
      <SectionHeader
        title="Análisis Económico"
        subtitle="Gate, revenue estimado y estructura de tickets por evento"
      />

      {/* Gate + Revenue bar chart */}
      <div className="bg-surface border border-border-s rounded-2xl p-6 mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-t2 mb-6">
          Gate vs Revenue Estimado (USD)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={gateData} barGap={4} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `$${v / 1_000_000}M`}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="gate" name="Gate" radius={[4, 4, 0, 0]}>
              {gateData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={COMPANY_COLOR[entry.company]}
                  fillOpacity={0.9}
                />
              ))}
            </Bar>
            <Bar dataKey="revenue" name="Revenue Est." radius={[4, 4, 0, 0]}>
              {gateData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={COMPANY_COLOR[entry.company]}
                  fillOpacity={0.35}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2 text-xs text-t2">
            <span className="w-3 h-3 rounded-sm bg-red-500" /> WWE
          </div>
          <div className="flex items-center gap-2 text-xs text-t2">
            <span className="w-3 h-3 rounded-sm bg-orange-500" /> AEW
          </div>
          <div className="flex items-center gap-2 text-xs text-t2">
            <span className="w-3 h-3 rounded-sm bg-border-s" /> Opacidad alta = Gate real · baja = Revenue est.
          </div>
        </div>
      </div>

      {/* Attendance chart */}
      <div className="bg-surface border border-border-s rounded-2xl p-6 mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-t2 mb-6">
          Asistencia por Evento
        </h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={attendanceData} barCategoryGap="35%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => fmt(v)}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip content={<AttendanceTooltip />} />
            <Bar dataKey="attendance" name="Asistencia" radius={[4, 4, 0, 0]}>
              {attendanceData.map((entry, i) => (
                <Cell key={i} fill={COMPANY_COLOR[entry.company]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Per-event detail table */}
      <div className="bg-surface border border-border-s rounded-2xl overflow-hidden mb-8">
        <div className="p-5 border-b border-border-s">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-t2">
            Detalle por Evento
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-s text-xs uppercase tracking-wider text-t3">
                <th className="px-5 py-3 text-left">Evento</th>
                <th className="px-5 py-3 text-right">Asistencia</th>
                <th className="px-5 py-3 text-right">Ocupación</th>
                <th className="px-5 py-3 text-right">Gate</th>
                <th className="px-5 py-3 text-right">Revenue Est.</th>
                <th className="px-5 py-3 text-center">Confianza Gate</th>
                <th className="px-5 py-3 text-center">Tickets</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-border-m hover:bg-elevated transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: COMPANY_COLOR[e.company] }}
                      />
                      <span className="text-t1 font-medium">{e.name}</span>
                      <span className="text-t3 text-xs">{e.year}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-dim tabular-nums">
                    {fmt(e.attendance)}
                  </td>
                  <td className="px-5 py-3 text-right tabular-nums">
                    {e.occupancy_pct != null ? (
                      <span
                        className={e.occupancy_pct >= 100 ? 'text-emerald-400' : 'text-dim'}
                      >
                        {e.occupancy_pct}%
                      </span>
                    ) : (
                      <span className="text-t4">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right text-dim tabular-nums">
                    {fmtUSD(e.gate_usd)}
                  </td>
                  <td className="px-5 py-3 text-right text-t2 tabular-nums">
                    {fmtUSD(e.total_revenue_est_usd)}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <ConfidenceBadge level={e.gate_confidence} />
                  </td>
                  <td className="px-5 py-3 text-center">
                    {e.gate_usd != null ? (
                      <button
                        onClick={() =>
                          setSelectedEvent(selectedEvent === e.id ? null : e.id)
                        }
                        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                          selectedEvent === e.id
                            ? 'bg-elevated border-border-s text-t1'
                            : 'border-border-s text-t2 hover:text-t1 hover:border-border-m'
                        }`}
                      >
                        {selectedEvent === e.id ? 'Cerrar' : 'Ver'}
                      </button>
                    ) : (
                      <span className="text-t4 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket breakdown expanded */}
      {selectedEvent && tickets && (
        <div className="bg-surface border border-border-s rounded-2xl p-6 animate-in fade-in duration-200">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-t2 mb-1">
            Estructura de Tickets — {tickets.event_id?.toUpperCase()}
          </h3>
          <p className="text-xs text-t3 mb-6">
            Moneda: {tickets.currency}
            {tickets.currency !== 'USD' && ` · Tasa USD: ${tickets.currency_usd_rate}`}
            {' · '}
            <ConfidenceBadge level={tickets.price_confidence} />
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Pie chart */}
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={tickets.categories.filter((c) => c.pct_of_total != null)}
                  dataKey="pct_of_total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {tickets.categories
                    .filter((c) => c.pct_of_total != null)
                    .map((cat) => (
                      <Cell key={cat.name} fill={cat.color_hex} />
                    ))}
                </Pie>
                <Tooltip
                  formatter={(v) => `${v}%`}
                  contentStyle={{
                    background: 'var(--tooltip-bg)',
                    border: '1px solid var(--tooltip-border)',
                    borderRadius: 8,
                  }}
                />
                <Legend
                  formatter={(v) => (
                    <span className="text-t2 text-xs">{v}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Category table */}
            <div className="space-y-3">
              {tickets.categories.map((cat) => (
                <div
                  key={cat.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-elevated"
                >
                  <span
                    className="w-3 h-3 rounded-sm flex-shrink-0"
                    style={{ background: cat.color_hex }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-t1 text-sm font-semibold">{cat.name}</p>
                    <p className="text-t3 text-xs truncate">{cat.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-t1 text-sm tabular-nums">
                      ${cat.price_face_min ?? '?'}–${cat.price_face_max ?? '?'}
                    </p>
                    {cat.pct_of_total && (
                      <p className="text-t2 text-xs">{cat.pct_of_total}%</p>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-2 border-t border-border-s flex justify-between text-sm">
                <span className="text-t2">Ticket promedio estimado</span>
                <span className="text-t1 font-bold tabular-nums">
                  ${tickets.avg_ticket_price_est ?? '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-t2">Sold out</span>
                <span
                  className={tickets.sellout ? 'text-emerald-400 font-semibold' : 'text-amber-400'}
                >
                  {tickets.sellout === true
                    ? 'Sí'
                    : tickets.sellout === false
                    ? 'No'
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          {tickets.notes && (
            <p className="mt-4 text-xs text-t3 italic border-t border-border-s pt-4">
              {tickets.notes}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
