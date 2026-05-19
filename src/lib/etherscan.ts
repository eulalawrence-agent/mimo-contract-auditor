const CHAINS: Record<string, { chainid: string; name: string; explorer: string }> = {
  ethereum: { chainid: '1', name: 'Ethereum', explorer: 'etherscan.io' },
  bsc: { chainid: '56', name: 'BSC', explorer: 'bscscan.com' },
  polygon: { chainid: '137', name: 'Polygon', explorer: 'polygonscan.com' },
  arbitrum: { chainid: '42161', name: 'Arbitrum', explorer: 'arbiscan.io' },
  optimism: { chainid: '10', name: 'Optimism', explorer: 'optimistic.etherscan.io' },
  base: { chainid: '8453', name: 'Base', explorer: 'basescan.org' },
  avalanche: { chainid: '43114', name: 'Avalanche', explorer: 'snowtrace.io' },
}

export interface ContractSource {
  sourceCode: string
  contractName: string
  compilerVersion: string
  abi: string
  chain: string
  explorer: string
  address: string
}

export async function fetchContractSource(
  address: string,
  chain: string = 'ethereum'
): Promise<ContractSource> {
  const chainConfig = CHAINS[chain]
  if (!chainConfig) {
    throw new Error('Unsupported chain: ' + chain)
  }

  const apiKey = process.env.ETHERSCAN_API_KEY
  if (!apiKey) {
    throw new Error('ETHERSCAN_API_KEY not configured')
  }

  const url = 'https://api.etherscan.io/v2/api?chainid=' + chainConfig.chainid +
    '&module=contract&action=getsourcecode&address=' + address + '&apikey=' + apiKey

  const response = await fetch(url, {
    headers: { 'User-Agent': 'MiMo-Auditor/1.0' },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error('Etherscan API error: ' + response.status)
  }

  const data = await response.json()

  if (data.status === '0' || !data.result || !data.result[0]) {
    const errMsg = typeof data.result === 'string' ? data.result : data.message
    throw new Error(errMsg || 'Contract not found or not verified')
  }

  const result = data.result[0]

  if (result.SourceCode === '') {
    throw new Error('Contract source code is not verified on this explorer')
  }

  let sourceCode = result.SourceCode
  if (sourceCode.startsWith('{{')) {
    try {
      const parsed = JSON.parse(sourceCode.slice(1, -1))
      sourceCode = Object.entries(parsed.sources || parsed)
        .map(([file, content]: [string, any]) => '// File: ' + file + '\n' + content.content)
        .join('\n\n')
    } catch {}
  } else if (sourceCode.startsWith('{')) {
    try {
      const parsed = JSON.parse(sourceCode)
      sourceCode = Object.entries(parsed.sources || parsed)
        .map(([file, content]: [string, any]) => '// File: ' + file + '\n' + (typeof content === 'string' ? content : content.content))
        .join('\n\n')
    } catch {}
  }

  return {
    sourceCode,
    contractName: result.ContractName || 'Unknown',
    compilerVersion: result.CompilerVersion || 'Unknown',
    abi: result.ABI || '[]',
    chain: chainConfig.name,
    explorer: chainConfig.explorer,
    address,
  }
}

export function getSupportedChains(): string[] {
  return Object.keys(CHAINS)
}
