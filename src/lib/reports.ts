// Client-side storage via localStorage
// Reports are stored on the client, not on the server

export interface StoredReport {
  id: string
  createdAt: string
  contract: {
    address: string
    name: string
    chain: string
    compiler: string
    explorer: string
  }
  audit: any
}

export function saveReport(report: StoredReport): string {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('report_' + report.id, JSON.stringify(report))
    } catch {}
  }
  return report.id
}

export function getReport(id: string): StoredReport | undefined {
  if (typeof window !== 'undefined') {
    try {
      const data = localStorage.getItem('report_' + id)
      if (data) return JSON.parse(data)
    } catch {}
  }
  return undefined
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
