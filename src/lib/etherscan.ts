const CHAINS: Record<string, { api: string; name: string; explorer: string }> = {
  ethereum: { api: 'https://api.etherscan.io/api', name: 'Ethereum', explorer: 'etherscan.io' },
  bsc: { api: 'https://api.bscscan.com/api', name: 'BSC', explorer: 'bscscan.com' },
  polygon: { api: 'https://api.polygonscan.com/api', name: 'Polygon', explorer: 'polygonscan.com' },
  arbitrum: { api: 'https://api.arbiscan.io/api', name: 'Arbitrum', explorer: 'arbiscan.io' },
  optimism: { api: 'https://api-optimistic.etherscan.io/api', name: 'Optimism', explorer: 'optimistic.etherscan.io' },
  base: { api: 'https://api.basescan.org/api', name: 'Base', explorer: 'basescan.org' },
  avalanche: { api: 'https://api.snowtrace.io/api', name: 'Avalanche', explorer: 'snowtrace.io' },
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
    throw new Error(`Unsupported chain: ${chain}. Supported: ${Object.keys(CHAINS).join(', ')}`)
  }

  const apiKey = process.env.ETHERSCAN_API_KEY || ''
  const url = `${chainConfig.api}?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`

  const response = await fetch(url, {
    headers: { 'User-Agent': 'MiMo-Auditor/1.0' },
    next: { revalidate: 300 }, // Cache 5 min
  })

  if (!response.ok) {
    throw new Error(`Etherscan API error: ${response.status}`)
  }

  const data = await response.json()

  if (data.status === '0' || !data.result?.[0]) {
    throw new Error(data.message || 'Contract not found or not verified')
  }

  const result = data.result[0]

  if (result.SourceCode === '') {
    throw new Error('Contract source code is not verified on this explorer')
  }

  // Handle multi-file contracts (JSON wrapped in double braces)
  let sourceCode = result.SourceCode
  if (sourceCode.startsWith('{{')) {
    try {
      const parsed = JSON.parse(sourceCode.slice(1, -1))
      sourceCode = Object.entries(parsed.sources || parsed)
        .map(([file, content]: [string, any]) => `// File: ${file}\n${content.content}`)
        .join('\n\n')
    } catch {
      // Keep as-is if parsing fails
    }
  } else if (sourceCode.startsWith('{')) {
    try {
      const parsed = JSON.parse(sourceCode)
      sourceCode = Object.entries(parsed.sources || parsed)
        .map(([file, content]: [string, any]) => `// File: ${file}\n${typeof content === 'string' ? content : content.content}`)
        .join('\n\n')
    } catch {
      // Keep as-is
    }
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

export function detectChain(address: string): string {
  // Default to ethereum — could add chain detection logic
  return 'ethereum'
}

export function getSupportedChains(): string[] {
  return Object.keys(CHAINS)
}
