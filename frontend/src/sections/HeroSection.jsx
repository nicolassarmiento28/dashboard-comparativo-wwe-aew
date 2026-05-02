import { useEffect, useState } from 'react'
import { api } from '../api/wrestling'
import KpiCard from '../components/KpiCard'

function fmt(n, opts = {}) {
  if (n == null) return null
  return new Intl.NumberFormat('en-US', opts).format(n)
}

function fmtUSD(n) {
  if (n == null) return null
  return `$${fmt(n / 1_000_000, { maximumFractionDigits: 1 })}M`
}

export default function HeroSection() {
  const [wwe, setWwe] = useState(null)
  const [aew, setAew] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.getSummary('WWE'),
      api.getSummary('AEW'),
    ]).then(([w, a]) => {
      setWwe(w.data)
      setAew(a.data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-orange-900/20 rounded-full blur-3xl" />
      </div>

      <div className="relative px-6 md:px-10 py-16 max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-red-500/15 text-red-400 border border-red-500/30 rounded-full">
              WWE
            </span>
            <span className="text-t3 font-bold text-lg">vs</span>
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-orange-500/15 text-orange-400 border border-orange-500/30 rounded-full">
              AEW
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-t1 tracking-tight leading-tight">
            WrestleMania vs All In
          </h1>
          <p className="mt-4 text-t2 text-lg max-w-2xl mx-auto">
            Análisis comparativo económico y de audiencia · 2023–2026
          </p>
        </div>

        {/* Head-to-head KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WWE column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-0.5 flex-1 bg-gradient-to-r from-red-500 to-transparent" />
              <span className="text-red-400 font-black text-sm uppercase tracking-widest">WWE WrestleMania</span>
              <div className="h-0.5 flex-1 bg-gradient-to-l from-red-500 to-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                label="Asistencia total"
                value={fmt(wwe?.total_attendance)}
                confidence="confirmed"
                company="WWE"
              />
              <KpiCard
                label="Gate total"
                value={fmtUSD(wwe?.total_gate_usd)}
                confidence="confirmed"
                company="WWE"
              />
              <KpiCard
                label="Revenue estimado"
                value={fmtUSD(wwe?.total_revenue_est_usd)}
                confidence="estimated"
                company="WWE"
              />
              <KpiCard
                label="Peak viewership"
                value={wwe?.peak_viewership ? fmt(wwe.peak_viewership) : '—'}
                subvalue="Peacock / Netflix"
                confidence={wwe?.peak_viewership ? 'estimated' : 'no_data'}
                company="WWE"
              />
            </div>
          </div>

          {/* AEW column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-5">
              <div className="h-0.5 flex-1 bg-gradient-to-r from-orange-500 to-transparent" />
              <span className="text-orange-400 font-black text-sm uppercase tracking-widest">AEW All In</span>
              <div className="h-0.5 flex-1 bg-gradient-to-l from-orange-500 to-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <KpiCard
                label="Asistencia total"
                value={fmt(aew?.total_attendance)}
                confidence="confirmed"
                company="AEW"
              />
              <KpiCard
                label="Gate total"
                value={fmtUSD(aew?.total_gate_usd)}
                confidence="estimated"
                company="AEW"
              />
              <KpiCard
                label="Revenue estimado"
                value={fmtUSD(aew?.total_revenue_est_usd)}
                confidence="estimated"
                company="AEW"
              />
              <KpiCard
                label="Peak viewership"
                value={aew?.peak_viewership ? fmt(aew.peak_viewership) : '—'}
                subvalue="TNT / TBS"
                confidence={aew?.peak_viewership ? 'estimated' : 'no_data'}
                company="AEW"
              />
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-8 text-center text-xs text-t4">
          Fuentes: WWE SEC filings · Wrestling Observer · PWTorch · Showbuzz Daily · AEW comunicados oficiales
        </p>
      </div>
    </section>
  )
}
