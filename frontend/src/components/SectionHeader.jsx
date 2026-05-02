export default function SectionHeader({ title, subtitle, company }) {
  const accent =
    company === 'WWE'
      ? 'from-red-500 to-red-800'
      : company === 'AEW'
      ? 'from-orange-500 to-orange-800'
      : 'from-accent to-accent/30'

  return (
    <div className="mb-8">
      <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${accent} mb-4`} />
      <h2 className="text-2xl md:text-3xl font-bold text-t1 tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-t2 text-sm max-w-2xl">{subtitle}</p>
      )}
    </div>
  )
}
