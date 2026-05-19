const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  reentrancy: { label: 'Reentrancy', icon: '🔄' },
  accessControl: { label: 'Access Control', icon: '🔐' },
  arithmetic: { label: 'Arithmetic', icon: '🧮' },
  frontRunning: { label: 'Front-running', icon: '🏃' },
  centralization: { label: 'Centralization', icon: '🏢' },
  gasOptimization: { label: 'Gas Optimization', icon: '⛽' },
}

export default function CategoryBar({ name, value }: { name: string; value: number }) {
  const info = CATEGORY_LABELS[name] || { label: name, icon: '📊' }
  const pct = (value / 10) * 100
  const color = value <= 3 ? 'bg-emerald-500' : value <= 6 ? 'bg-amber-500' : 'bg-red-500'
  const textColor = value <= 3 ? 'text-emerald-400' : value <= 6 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="flex items-center gap-3">
      <span className="text-lg w-7 text-center">{info.icon}</span>
      <div className="flex-1">
        <div className="flex justify-between mb-1.5">
          <span className="text-sm text-dark-300">{info.label}</span>
          <span className={`text-sm font-semibold ${textColor}`}>{value}/10</span>
        </div>
        <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${color} transition-all duration-1000 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
