"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoadingState from '@/components/LoadingState'

const CHAINS = [
  { id: 'ethereum', name: 'Ethereum', icon: '⟠' },
  { id: 'bsc', name: 'BSC', icon: '⬢' },
  { id: 'polygon', name: 'Polygon', icon: '⬡' },
  { id: 'arbitrum', name: 'Arbitrum', icon: '🔵' },
  { id: 'optimism', name: 'Optimism', icon: '🔴' },
  { id: 'base', name: 'Base', icon: '🔷' },
  { id: 'avalanche', name: 'Avalanche', icon: '🔺' },
]

const EXAMPLES = [
  { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', name: 'USDT (Tether)', chain: 'ethereum' },
  { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', name: 'UNI (Uniswap)', chain: 'ethereum' },
  { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', name: 'WBTC', chain: 'ethereum' },
]

export default function Home() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [chain, setChain] = useState('ethereum')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState('')

  const handleAnalyze = async () => {
    if (!address.trim()) {
      setError('Please enter a contract address')
      return
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      setError('Invalid address format. Must be 0x followed by 40 hex characters.')
      return
    }

    setError('')
    setLoading(true)
    setStep('Fetching contract source code...')

    try {
      // Small delay for UX
      await new Promise(r => setTimeout(r, 500))
      setStep('Analyzing with MiMo AI...')

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim(), chain }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setStep('Report generated!')
      await new Promise(r => setTimeout(r, 500))
      router.push(`/report/${data.reportId}`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState step={step} />
  }

  return (
    <div className="py-12 sm:py-20">
      {/* Hero */}
      <div className="text-center mb-16 animate-in">
        <div className="inline-flex items-center gap-2 bg-mimo-500/10 border border-mimo-500/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-mimo-400 animate-pulse" />
          <span className="text-sm text-mimo-400 font-medium">Powered by Xiaomi MiMo</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-bold mb-4">
          <span className="text-gradient">Smart Contract</span>
          <br />
          <span className="text-dark-100">Security Auditor</span>
        </h1>
        
        <p className="text-dark-400 text-lg max-w-2xl mx-auto leading-relaxed">
          AI-powered vulnerability detection for Solidity contracts. 
          Paste any contract address and get a comprehensive security report in seconds.
        </p>
      </div>

      {/* Input Card */}
      <div className="max-w-2xl mx-auto animate-in stagger-1 opacity-0">
        <div className="glass-card p-6 sm:p-8">
          {/* Chain selector */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-dark-300 mb-2.5">Blockchain Network</label>
            <div className="flex flex-wrap gap-2">
              {CHAINS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setChain(c.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    chain === c.id
                      ? 'bg-mimo-500/20 text-mimo-300 border border-mimo-500/30'
                      : 'bg-dark-800/50 text-dark-400 border border-dark-700/50 hover:border-dark-600'
                  }`}
                >
                  <span className="mr-1.5">{c.icon}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Address input */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-dark-300 mb-2.5">Contract Address</label>
            <input
              type="text"
              value={address}
              onChange={e => { setAddress(e.target.value); setError('') }}
              placeholder="0x..."
              className="input-field"
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            />
            {error && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <span>⚠️</span> {error}
              </p>
            )}
          </div>

          {/* Submit */}
          <button onClick={handleAnalyze} className="btn-primary w-full text-lg py-4">
            🔍 Analyze Contract
          </button>
        </div>
      </div>

      {/* Example contracts */}
      <div className="max-w-2xl mx-auto mt-8 animate-in stagger-2 opacity-0">
        <p className="text-dark-500 text-sm mb-3">Try these examples:</p>
        <div className="space-y-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex.address}
              onClick={() => { setAddress(ex.address); setChain(ex.chain); setError('') }}
              className="w-full text-left glass-card-hover px-4 py-3 flex items-center justify-between group"
            >
              <div>
                <span className="text-dark-200 text-sm font-medium">{ex.name}</span>
                <span className="text-dark-500 text-xs font-mono ml-2">{ex.address.slice(0, 10)}...{ex.address.slice(-8)}</span>
              </div>
              <span className="text-dark-500 text-xs group-hover:text-mimo-400 transition-colors">
                Click to try →
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-4xl mx-auto mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in stagger-3 opacity-0">
        {[
          { icon: '🤖', title: 'MiMo AI Analysis', desc: 'Advanced reasoning detects complex vulnerability patterns that static analyzers miss.' },
          { icon: '⚡', title: 'Instant Results', desc: 'Full security report generated in under 30 seconds. No signup required.' },
          { icon: '🔗', title: 'Multi-Chain', desc: 'Supports Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, and Avalanche.' },
        ].map(f => (
          <div key={f.title} className="glass-card-hover p-6 text-center">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-dark-100 mb-2">{f.title}</h3>
            <p className="text-dark-400 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
