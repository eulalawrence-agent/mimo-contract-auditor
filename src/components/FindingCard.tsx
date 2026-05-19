import SeverityBadge from './SeverityBadge'

interface Finding {
  id: string
  severity: string
  title: string
  description: string
  line?: string
  recommendation: string
}

export default function FindingCard({ finding, index }: { finding: Finding; index: number }) {
  return (
    <div className="glass-card p-5 animate-in opacity-0" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-dark-500 text-sm font-mono">{finding.id}</span>
          <h4 className="font-semibold text-dark-100">{finding.title}</h4>
        </div>
        <SeverityBadge severity={finding.severity} />
      </div>
      
      <p className="text-dark-300 text-sm leading-relaxed mb-3">{finding.description}</p>
      
      {finding.line && (
        <div className="bg-dark-900/80 rounded-lg p-3 mb-3 overflow-x-auto">
          <code className="text-xs text-mimo-300 font-mono whitespace-pre">{finding.line}</code>
        </div>
      )}
      
      <div className="flex items-start gap-2">
        <span className="text-mimo-400 text-sm mt-0.5">💡</span>
        <p className="text-dark-400 text-sm">{finding.recommendation}</p>
      </div>
    </div>
  )
}
