import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { api } from '../api/wrestling'
import SectionHeader from '../components/SectionHeader'
import ConfidenceBadge from '../components/ConfidenceBadge'

const COMPANY_COLOR = { WWE: '#ef4444', AEW: '#f97316' }
const EVENT_LABELS = {
  wm40: 'WM 40',
  wm41: 'WM 41',
  allin23: 'All In 23',
  allin24: 'All In 24',
}

const MEDAL = ['🥇', '🥈', '🥉']

function RankBadge({ rank }) {
  return (
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-elevated border border-border-s text-sm font-black text-t1 tabular-nums">
      {rank}
    </div>
  )
}

function MerchTable({ rankings, eventId }) {
  const filtered = rankings.filter((r) => r.event_id === eventId)
  if (!filtered.length) return null

  const chartData = filtered.map((r) => ({
    name: r.name.split(' ').slice(-1)[0], // last name for brevity
    rank: 6 - r.rank, // invert so #1 is tallest
    company: r.company,
    fullName: r.name,
  }))

  return (
    <div>
      {/* Bar chart — inverted rank */}
      <div className="mb-6">
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="bg-elevated border border-border-s rounded-lg p-2 text-xs">
                    <p className="text-t1 font-semibold">{d.fullName}</p>
                    <p style={{ color: COMPANY_COLOR[d.company] }}>{d.company}</p>
                    <p className="text-t2">Rank #{6 - d.rank}</p>
                  </div>
                )
              }}
            />
            <Bar dataKey="rank" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={COMPANY_COLOR[entry.company]} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ranking list */}
      <div className="space-y-2">
        {filtered.map((r) => (
          <div
            key={r.wrestler_id}
            className="flex items-start gap-3 p-3 rounded-xl bg-elevated hover:bg-elevated/80 transition-colors"
          >
            <RankBadge rank={r.rank} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-t1 font-semibold text-sm">{r.name}</p>
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-bold"
                  style={{
                    background: `${COMPANY_COLOR[r.company]}20`,
                    color: COMPANY_COLOR[r.company],
                  }}
                >
                  {r.company}
                </span>
                <ConfidenceBadge level={r.confidence} />
              </div>
              {r.notes && (
                <p className="text-xs text-t3 mt-0.5 leading-relaxed line-clamp-2">
                  {r.notes}
                </p>
              )}
              {r.merch_items?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {r.merch_items.slice(0, 3).map((item) => (
                    <span
                      key={item}
                      className="text-xs px-2 py-0.5 rounded-full bg-elevated border border-border-s text-t2"
                    >
                      {item}
                    </span>
                  ))}
                  {r.merch_items.length > 3 && (
                    <span className="text-xs text-t4">
                      +{r.merch_items.length - 3} más
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function WrestlersSection() {
  const [rankings, setRankings] = useState([])
  const [wrestlers, setWrestlers] = useState([])
  const [activeEvent, setActiveEvent] = useState('wm40')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getTopMerch(), api.getWrestlers()]).then(([m, w]) => {
      setRankings(m.data)
      setWrestlers(w.data)
      setLoading(false)
    })
  }, [])

  const availableEvents = [...new Set(rankings.map((r) => r.event_id))].sort()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const mainEventWrestler = wrestlers.find(
    (w) => w.merch_ranking.find((m) => m.event_id === activeEvent && m.rank === 1)
  )

  return (
    <section className="px-6 md:px-10 py-16 max-w-7xl mx-auto">
      <SectionHeader
        title="Luchadores & Merch Rankings"
        subtitle="Top vendedores de merchandising por evento"
      />

      {/* Event selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {availableEvents.map((eid) => {
          const ev = rankings.find((r) => r.event_id === eid)
          const isWWE = ['wm40', 'wm41', 'wm42'].includes(eid)
          return (
            <button
              key={eid}
              onClick={() => setActiveEvent(eid)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                activeEvent === eid
                  ? isWWE
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'bg-orange-500 border-orange-500 text-white'
                  : 'border-border-s text-t2 hover:text-t1 hover:border-border-m'
              }`}
            >
              {EVENT_LABELS[eid] ?? eid}
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rankings table */}
        <div className="md:col-span-2 bg-surface border border-border-s rounded-2xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-t2 mb-6">
            Top Merch — {EVENT_LABELS[activeEvent]}
          </h3>
          <MerchTable rankings={rankings} eventId={activeEvent} />
        </div>

        {/* Top seller spotlight */}
        {mainEventWrestler && (
          <div className="bg-surface border border-border-s rounded-2xl p-6 flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-widest text-t2 mb-4">
              Top vendedor
            </p>
            <div
              className="flex-1 rounded-xl p-5 flex flex-col gap-3"
              style={{
                background: `linear-gradient(135deg, ${COMPANY_COLOR[mainEventWrestler.company]}15 0%, transparent 100%)`,
                border: `1px solid ${COMPANY_COLOR[mainEventWrestler.company]}30`,
              }}
            >
              <div>
                <p
                  className="text-2xl font-black"
                  style={{ color: COMPANY_COLOR[mainEventWrestler.company] }}
                >
                  {mainEventWrestler.name}
                </p>
                <p className="text-sm text-t2">{mainEventWrestler.company}</p>
              </div>

              {mainEventWrestler.notes && (
                <p className="text-sm text-dim leading-relaxed">
                  {mainEventWrestler.notes}
                </p>
              )}

              <div className="mt-auto">
                <p className="text-xs text-t3 uppercase tracking-widest mb-2">Items</p>
                <div className="flex flex-wrap gap-1.5">
                  {mainEventWrestler.merch_items?.map((item) => (
                    <span
                      key={item}
                      className="text-xs px-2 py-1 rounded-lg bg-elevated text-dim border border-border-s"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-t3 uppercase tracking-widest mb-2">
                  Apariciones
                </p>
                {mainEventWrestler.appearances.map((a) => {
                  const label = EVENT_LABELS[a.event_id] ?? a.event_id
                  return (
                    <div key={a.event_id} className="flex justify-between text-xs text-t2">
                      <span>{label}</span>
                      <span
                        className={
                          a.result === 'win' ? 'text-emerald-400' : 'text-t3'
                        }
                      >
                        {a.result === 'win' ? 'Victoria' : 'Derrota'}
                        {a.title ? ` · ${a.title}` : ''}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All wrestlers overview */}
      <div className="mt-8 bg-surface border border-border-s rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-border-s">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-t2">
            Todos los luchadores
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-s text-xs uppercase tracking-wider text-t3">
                <th className="px-5 py-3 text-left">Nombre</th>
                <th className="px-5 py-3 text-left">Empresa</th>
                <th className="px-5 py-3 text-left">Años activos</th>
                <th className="px-5 py-3 text-right">Rankings</th>
              </tr>
            </thead>
            <tbody>
              {wrestlers.map((w) => (
                <tr
                  key={w.id}
                  className="border-b border-border-m hover:bg-elevated transition-colors"
                >
                  <td className="px-5 py-3">
                    <span className="text-t1 font-medium">{w.name}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded"
                      style={{
                        background: `${COMPANY_COLOR[w.company]}20`,
                        color: COMPANY_COLOR[w.company],
                      }}
                    >
                      {w.company}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-t2 text-xs">
                    {w.active_years.join(', ')}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {w.merch_ranking.map((mr) => (
                        <span
                          key={mr.event_id}
                          className="text-xs px-2 py-0.5 rounded-full bg-elevated border border-border-s text-dim tabular-nums"
                        >
                          {EVENT_LABELS[mr.event_id]} #{mr.rank}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
