export default function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { bg: string; text: string; border: string }> = {
    critical: { bg: 'bg-red-600/20', text: 'text-red-300', border: 'border-red-500/30' },
    high: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20' },
    medium: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/20' },
    low: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/20' },
    info: { bg: 'bg-dark-600/30', text: 'text-dark-300', border: 'border-dark-500/20' },
  }

  const c = config[severity] || config.info

  return (
    <span className={\`${c.bg} ${c.text} ${c.border} border px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider\`}>
      {severity}
    </span>
  )
}
