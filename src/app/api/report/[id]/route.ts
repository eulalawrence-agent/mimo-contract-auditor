import { NextRequest, NextResponse } from 'next/server'
import { getReport } from '@/lib/reports'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const report = getReport(id)

  if (!report) {
    return NextResponse.json(
      { error: 'Report not found.' },
      { status: 404 }
    )
  }

  return NextResponse.json(report)
}
