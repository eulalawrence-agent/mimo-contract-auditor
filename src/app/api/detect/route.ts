import { NextRequest, NextResponse } from 'next/server'

const CHAINS: Record<string, { chainid: string; name: string }> = {
  ethereum: { chainid: '1', name: 'Ethereum' },
  bsc: { chainid: '56', name: 'BSC' },
  base: { chainid: '8453', name: 'Base' },
  arbitrum: { chainid: '42161', name: 'Arbitrum' },
  polygon: { chainid: '137', name: 'Polygon' },
  optimism: { chainid: '10', name: 'Optimism' },
  avalanche: { chainid: '43114', name: 'Avalanche' },
}

async function checkChain(address: string, chainid: string, apiKey: string): Promise<boolean> {
  try {
    const url = 'https://api.etherscan.io/v2/api?chainid=' + chainid +
      '&module=contract&action=getsourcecode&address=' + address + '&apikey=' + apiKey
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    const data = await res.json()
    if (data.status === '1' && data.result && data.result[0] && data.result[0].SourceCode) {
      return data.result[0].SourceCode !== ''
    }
    return false
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { address } = body

    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid address' }, { status: 400 })
    }

    const apiKey = process.env.ETHERSCAN_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const entries = Object.entries(CHAINS)
    const promises = entries.map(async ([key, chain]) => {
      const found = await checkChain(address, chain.chainid, apiKey)
      return { key, name: chain.name, found }
    })

    const results = await Promise.all(promises)
    const match = results.find(r => r.found)

    if (match) {
      return NextResponse.json({ chain: match.key, name: match.name })
    }

    return NextResponse.json({ chain: null, name: null, message: 'No verified contract found on supported chains' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
