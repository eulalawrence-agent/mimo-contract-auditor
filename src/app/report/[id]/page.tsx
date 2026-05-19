"use client"

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ScoreRing from '@/components/ScoreRing'
import CategoryBar from '@/components/CategoryBar'
import FindingCard from '@/components/FindingCard'
import LoadingState from '@/components/LoadingState'

interface Finding {
  id: string
  severity: string
  title: string
  description: string
  line?: string
  recommendation: string
}

interface Report {
  id: string
  createdAt: string
  contract: {
    address: string
    name: string
    chain: string
    compiler: string
    explorer: string
  }
  audit: {
    score: number
    riskLevel: string
    summary: string
    findings: Finding[]
    categories: Record<string, number>
    recommendation: string
    modelUsed: string
  }
}

export default function ReportPage() {
  const params = useParams()
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = params.id as string

    // Try localStorage first
    try {
      const stored = localStorage.getItem('mimo_report_' + id)
      if (stored) {
        setReport(JSON.parse(stored))
        return
      }
    } catch {}

    // Fallback: try API (won't work on serverless, but just in case)
    fetch('/api/report/' + id)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.id) {
          setReport(data)
        } else {
          setError('Report not found. It may have expired or was generated in a different session.')
        }
      })
      .catch(() => {
        setError('Report not found.')
      })
  }, [params.id])

  if (error) {
    return (
      <div className="py-20 text-center">
        <div className="text-5xl mb-4">X</div>
        <h2 className="text-2xl font-bold text-dark-100 mb-2">Report Not Found</h2>
        <p className="text-dark-400 mb-6">{error}</p>
        <a href="/" className="btn-primary">Back to Auditor</a>
      </div>
    )
  }

  if (!report) {
    return <LoadingState step="Loading report..." />
  }

  const { contract, audit } = report

  const riskColor: Record<string, string> = {
    safe: 'text-emerald-400',
    low: 'text-emerald-400',
    medium: 'text-amber-400',
    high: 'text-orange-400',
    critical: 'text-red-400',
  }

  const recommendationColor: Record<string, string> = {
    'SAFE TO DEPLOY': 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300',
    'DEPLOY WITH CAUTION': 'border-amber-500/30 bg-amber-500/5 text-amber-300',
    'NEEDS REVIEW': 'border-orange-500/30 bg-orange-500/5 text-orange-300',
    'DO NOT DEPLOY': 'border-red-500/30 bg-red-500/5 text-red-300',
  }

  const severityCounts = audit.findings.reduce((acc: Record<string, number>, f: Finding) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="py-8 sm:py-12">
      <div className="mb-8">
        <a href="/" className="text-dark-500 hover:text-dark-300 text-sm mb-4 inline-flex items-center gap-1 transition-colors">
          Back to Auditor
        </a>
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-100 mb-1">
              {contract.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-dark-400">{contract.chain}</span>
              <span className="text-dark-600">|</span>
              <span className="font-mono text-dark-500">{contract.address.slice(0, 8)}...{contract.address.slice(-6)}</span>
              <span className="text-dark-600">|</span>
              <span className="text-dark-500">{contract.compiler}</span>
            </div>
          </div>
          <span className="text-xs text-dark-500">
            {new Date(report.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-8 flex flex-col items-center justify-center lg:col-span-1">
          <h2 className="text-sm font-medium text-dark-400 mb-4 uppercase tracking-wider">Safety Score</h2>
          <ScoreRing score={audit.score} />
          <div className={`mt-4 text-lg font-bold uppercase ${riskColor[audit.riskLevel] || 'text-dark-300'}`}>
            {audit.riskLevel} Risk
          </div>
        </div>

        <div className="glass-card p-6 lg:col-span-2 flex flex-col gap-5">
          <div>
            <h2 className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-3">Executive Summary</h2>
            <p className="text-dark-200 leading-relaxed">{audit.summary}</p>
          </div>

          <div>
            <h2 className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-3">AI Recommendation</h2>
            <div className={`border rounded-xl p-4 ${recommendationColor[audit.recommendation] || 'border-dark-600 bg-dark-800/50 text-dark-200'}`}>
              <span className="font-bold text-lg">{audit.recommendation}</span>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-3">Findings Summary</h2>
            <div className="flex flex-wrap gap-2">
              {['critical', 'high', 'medium', 'low', 'info'].map(sev => {
                const count = severityCounts[sev] || 0
                if (count === 0) return null
                return (
                  <span key={sev} className={`badge-${sev === 'info' ? 'safe' : sev}`}>
                    {count} {sev}
                  </span>
                )
              })}
              {audit.findings.length === 0 && (
                <span className="badge-safe">No issues found</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 mb-8">
        <h2 className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-5">Risk Category Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(audit.categories).map(([key, value]) => (
            <CategoryBar key={key} name={key} value={value as number} />
          ))}
        </div>
      </div>

      {audit.findings.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium text-dark-400 uppercase tracking-wider mb-5">
            Detailed Findings ({audit.findings.length})
          </h2>
          <div className="space-y-4">
            {audit.findings.map((finding: Finding, index: number) => (
              <FindingCard key={finding.id} finding={finding} index={index} />
            ))}
          </div>
        </div>
      )}

      <div className="glass-card p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-dark-500">
        <span>Model: {audit.modelUsed}</span>
        <span>Chain: {contract.chain} ({contract.explorer})</span>
        <a
          href={`https://${contract.explorer}/address/${contract.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-mimo-400 hover:text-mimo-300 transition-colors"
        >
          View on Explorer
        </a>
      </div>
    </div>
  )
}
