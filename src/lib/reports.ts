// In-memory report storage (fine for demo/serverless)
// Each cold start resets — for production, use Vercel KV or a DB

const reports = new Map<string, StoredReport>()

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
  const id = report.id
  reports.set(id, report)
  return id
}

export function getReport(id: string): StoredReport | undefined {
  return reports.get(id)
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
