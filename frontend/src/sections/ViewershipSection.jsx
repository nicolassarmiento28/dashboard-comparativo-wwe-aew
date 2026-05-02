import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { api } from '../api/wrestling'
import SectionHeader from '../components/SectionHeader'
import KpiCard from '../components/KpiCard'
import ConfidenceBadge from '../components/ConfidenceBadge'

function fmt(n) {
  if (n == null) return '—'
  return new Intl.NumberFormat('en-US').format(n)
}

const COLORS = {
  wm40: '#ef4444',
  wm41: '#f87171',
  allin23: '#f97316',
  allin24: '#fb923c',
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-elevated border border-border-s rounded-lg p-3 text-sm min-w-32">
      <p className="text-dim font-semibold mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="tabular-nums">
          {fmt(p.value)}
        </p>
      ))}
    </div>
  )
}

function ViewershipCard({ v, events }) {
  const event = events.find((e) => e.id === v.event_id)
  const color = COLORS[v.event_id] ?? '#94a3b8'
  const contextData =
    v.weekly_context ?? v.weekly_dynamite_context ?? v.monthly_raw_netflix

  return (
    <div className="bg-surface border border-border-s rounded-2xl p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: color }}
            />
            <p className="text-t1 font-bold text-sm">{event?.name ?? v.event_id}</p>
          </div>
          <p className="text-xs text-t3">
            {v.platform} · {event?.year}
          </p>
        </div>
        <ConfidenceBadge level={v.peak_viewers_confidence} />
      </div>

      {/* Main metric */}
      <div className="mb-4">
        <p className="text-xs text-t2 uppercase tracking-widest mb-1">Peak Viewers</p>
        {v.peak_viewers != null ? (
          <p className="text-3xl font-black tabular-nums" style={{ color }}>
            {fmt(v.peak_viewers)}
          </p>
        ) : (
          <p className="text-t4 text-lg">Sin datos</p>
        )}
        {v.demo_rating_18_49 != null && (
          <p className="text-xs text-t2 mt-1">
            Demo 18-49: <span className="text-dim">{v.demo_rating_18_49}</span>
          </p>
        )}
      </div>

      {/* Context chart */}
      {contextData && contextData.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-t3 mb-3 uppercase tracking-widest">
            Contexto de audiencia
          </p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={contextData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#64748b', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
                tick={{ fill: '#64748b', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                formatter={(v) => fmt(v)}
                contentStyle={{
                  background: 'var(--tooltip-bg)',
                  border: '1px solid var(--tooltip-border)',
                  borderRadius: 6,
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey={contextData[0]?.raw_viewers != null ? 'raw_viewers' : 'viewers'}
                dot={{ r: 3, fill: color }}
                stroke={color}
                strokeWidth={2}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {v.notes && (
        <p className="mt-4 text-xs text-t3 italic border-t border-border-s pt-3 line-clamp-3">
          {v.notes}
        </p>
      )}
    </div>
  )
}

export default function ViewershipSection() {
  const [viewership, setViewership] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getAllViewership(), api.getEvents()]).then(([v, e]) => {
      setViewership(v.data)
      setEvents(e.data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const hasData = viewership.filter((v) => v.peak_viewers != null)

  // Summary bar for WWE vs AEW peak
  const wwePeak = Math.max(
    ...viewership
      .filter((v) => events.find((e) => e.id === v.event_id)?.company === 'WWE' && v.peak_viewers)
      .map((v) => v.peak_viewers)
  )
  const aewPeak = Math.max(
    ...viewership
      .filter((v) => events.find((e) => e.id === v.event_id)?.company === 'AEW' && v.peak_viewers)
      .map((v) => v.peak_viewers)
  )

  return (
    <section className="px-6 md:px-10 py-16 max-w-7xl mx-auto">
      <SectionHeader
        title="Audiencia & Viewership"
        subtitle="Peak viewers, ratings demo 18-49 y contexto semanal de audiencia"
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <KpiCard
          label="WWE Peak (histórico)"
          value={fmt(wwePeak)}
          subvalue="WM41 en Netflix"
          confidence="estimated"
          company="WWE"
        />
        <KpiCard
          label="AEW Peak (histórico)"
          value={fmt(aewPeak)}
          subvalue="All In 2023 TNT"
          confidence="estimated"
          company="AEW"
        />
        <KpiCard
          label="Plataforma WWE actual"
          value="Netflix"
          subvalue="Global 190 países"
          company="WWE"
        />
        <KpiCard
          label="Plataforma AEW actual"
          value="TBS / Max"
          subvalue="Cable + streaming"
          company="AEW"
        />
      </div>

      {/* Platform context note */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 text-sm text-amber-300">
        <span className="font-semibold">Nota metodológica:</span> Las cifras de WWE en Netflix no
        son auditadas con Nielsen — Netflix reporta horas vistas semanales, no concurrentes en tiempo
        real. Los datos de AEW en cable (TNT/TBS) son metodológicamente comparables entre sí.
      </div>

      {/* Per-event cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {viewership.map((v) => (
          <ViewershipCard key={v.id} v={v} events={events} />
        ))}
      </div>
    </section>
  )
}
