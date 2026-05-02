import ConfidenceBadge from './ConfidenceBadge'

export default function KpiCard({
  label,
  value,
  subvalue,
  confidence,
  company,
  highlight = false,
}) {
  const companyAccent =
    company === 'WWE'
      ? 'border-t-red-500'
      : company === 'AEW'
      ? 'border-t-orange-500'
      : 'border-t-accent'

  return (
    <div
      className={`relative bg-surface border border-border-s border-t-2 ${companyAccent} rounded-xl p-5 flex flex-col gap-2 ${
        highlight ? 'ring-1 ring-white/10' : ''
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-t2">
        {label}
      </p>
      <p className="text-2xl font-bold text-t1 leading-tight">{value ?? '—'}</p>
      {subvalue && (
        <p className="text-sm text-t2 leading-snug">{subvalue}</p>
      )}
      {confidence && (
        <div className="mt-auto pt-2">
          <ConfidenceBadge level={confidence} />
        </div>
      )}
    </div>
  )
}
