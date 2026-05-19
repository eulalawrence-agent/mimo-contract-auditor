import { NextRequest, NextResponse } from 'next/server'
import { fetchContractSource, getSupportedChains } from '@/lib/etherscan'
import { analyzeContract } from '@/lib/mimo'
import { saveReport, generateId } from '@/lib/reports'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { address, chain = 'ethereum' } = body

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: 'Invalid contract address.' },
        { status: 400 }
      )
    }

    if (!getSupportedChains().includes(chain)) {
      return NextResponse.json(
        { error: 'Unsupported chain.' },
        { status: 400 }
      )
    }

    const contractSource = await fetchContractSource(address, chain)
    const auditResult = await analyzeContract(
      contractSource.sourceCode,
      contractSource.contractName,
      contractSource.chain
    )

    const reportId = generateId()
    const report = {
      id: reportId,
      createdAt: new Date().toISOString(),
      contract: {
        address: contractSource.address,
        name: contractSource.contractName,
        chain: contractSource.chain,
        compiler: contractSource.compilerVersion,
        explorer: contractSource.explorer,
      },
      audit: auditResult,
    }

    saveReport(report)

    return NextResponse.json({
      success: true,
      reportId,
      contract: report.contract,
      audit: auditResult,
    })
  } catch (error: any) {
    console.error('Analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Analysis failed.' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    name: 'MiMo Contract Auditor API',
    version: '1.0.0',
    supportedChains: getSupportedChains(),
    usage: 'POST { address: "0x...", chain: "ethereum" }',
  })
}
