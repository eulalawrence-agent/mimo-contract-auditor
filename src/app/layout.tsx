import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MiMo Contract Auditor - AI Smart Contract Security Analysis',
  description: 'AI-powered smart contract vulnerability scanner powered by Xiaomi MiMo. Detect reentrancy, rug pulls, honeypots, and more.',
  keywords: ['smart contract', 'auditor', 'security', 'blockchain', 'MiMo', 'AI', 'Solidity'],
  openGraph: {
    title: 'MiMo Contract Auditor',
    description: 'AI-Powered Smart Contract Security Analysis',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-950">
        {/* Background effects */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-mimo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-dark-900/50 via-dark-950 to-dark-950" />
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          {/* Nav */}
          <nav className="border-b border-dark-800/50 backdrop-blur-sm bg-dark-950/80 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-mimo-500 to-emerald-600 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <span className="font-bold text-lg">
                  <span className="text-gradient">MiMo</span>
                  <span className="text-dark-300 ml-1">Auditor</span>
                </span>
              </a>
              <div className="flex items-center gap-3">
                <span className="text-xs text-dark-500 hidden sm:block">Powered by</span>
                <span className="text-sm font-semibold text-mimo-400">Xiaomi MiMo</span>
              </div>
            </div>
          </nav>
          
          {/* Main */}
          <main className="max-w-6xl mx-auto px-4 sm:px-6">
            {children}
          </main>
          
          {/* Footer */}
          <footer className="border-t border-dark-800/50 mt-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-dark-500 text-sm">
                © 2026 MiMo Contract Auditor. Powered by Xiaomi MiMo AI.
              </p>
              <div className="flex items-center gap-4 text-dark-500 text-sm">
                <span>Built for MiMo 100T Program</span>
                <span className="w-1 h-1 rounded-full bg-dark-600" />
                <a href="https://github.com" className="hover:text-mimo-400 transition-colors">GitHub</a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
