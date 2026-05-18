export default function LoadingState({ step }: { step: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-8">
      {/* Animated shield */}
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-mimo-500/20 to-emerald-500/20 flex items-center justify-center animate-pulse">
          <svg className="w-12 h-12 text-mimo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        {/* Orbiting dot */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-mimo-400 rounded-full" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-dark-100">{step}</h3>
        <p className="text-dark-400 text-sm">This may take 15-30 seconds...</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-mimo-500 animate-bounce"
            style={{ animationDelay: \`\${i * 0.15}s\` }}
          />
        ))}
      </div>
    </div>
  )
}
