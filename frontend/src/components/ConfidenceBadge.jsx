const CONFIDENCE_CONFIG = {
  confirmed: {
    label: 'Confirmado',
    bg: 'bg-emerald-500/15',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  estimated: {
    label: 'Estimado',
    bg: 'bg-amber-500/15',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-400',
  },
  no_data: {
    label: 'Sin datos',
    bg: 'bg-t3/15',
    text: 'text-t2',
    border: 'border-border-s',
    dot: 'bg-t2',
  },
}

export default function ConfidenceBadge({ level }) {
  const cfg = CONFIDENCE_CONFIG[level] ?? CONFIDENCE_CONFIG.no_data
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
