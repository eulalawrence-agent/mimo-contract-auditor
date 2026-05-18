import OpenAI from 'openai'

export interface Finding {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info'
  title: string
  description: string
  line?: string
  recommendation: string
}

export interface AuditResult {
  score: number
  riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical'
  summary: string
  findings: Finding[]
  categories: {
    reentrancy: number
    accessControl: number
    arithmetic: number
    frontRunning: number
    centralization: number
    gasOptimization: number
  }
  recommendation: string
  modelUsed: string
}

function getClient() {
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY || '',
  })
}

const SYSTEM_PROMPT = \`You are MiMo Contract Auditor, an expert smart contract security analyst developed by Xiaomi.

Your job is to analyze Solidity smart contracts for security vulnerabilities, code quality issues, and potential risks.

ANALYSIS FRAMEWORK:
1. Reentrancy Attacks (reentrancy, cross-function reentrancy, cross-contract reentrancy)
2. Access Control (missing modifiers, unprotected functions, tx.origin usage)
3. Arithmetic Issues (overflow/underflow, division by zero, unchecked returns)
4. Front-running & MEV (predictable randomness, transaction ordering dependence)
5. Centralization Risks (owner privileges, pause mechanisms, upgrade patterns)
6. Gas Optimization (storage vs memory, loop optimizations, redundant operations)
7. Rug Pull Patterns (hidden mints, blacklist functions, hidden fees, proxy traps)
8. Honeypot Detection (transfer restrictions, hidden balance manipulation)

RESPONSE FORMAT:
You MUST respond with valid JSON only, no markdown fences. Structure:

{
  "score": <0-100 safety score>,
  "riskLevel": "<safe|low|medium|high|critical>",
  "summary": "<2-3 sentence executive summary>",
  "findings": [
    {
      "id": "<F-001>",
      "severity": "<critical|high|medium|low|info>",
      "title": "<short title>",
      "description": "<detailed explanation>",
      "line": "<relevant code snippet or line reference>",
      "recommendation": "<how to fix>"
    }
  ],
  "categories": {
    "reentrancy": <0-10 risk score>,
    "accessControl": <0-10 risk score>,
    "arithmetic": <0-10 risk score>,
    "frontRunning": <0-10 risk score>,
    "centralization": <0-10 risk score>,
    "gasOptimization": <0-10 risk score>
  },
  "recommendation": "<overall recommendation: DEPLOY WITH CAUTION / DO NOT DEPLOY / SAFE TO DEPLOY / NEEDS REVIEW>"
}

Be thorough but practical. Flag real issues, not theoretical concerns. If the contract is simple and safe, say so.
\`

export async function analyzeContract(
  sourceCode: string,
  contractName: string,
  chain: string
): Promise<AuditResult> {
  const client = getClient()
  const model = process.env.MIMO_MODEL || 'xiaomi/mimo-v2.5-pro'

  // Truncate if too long (serverless timeout concerns)
  const maxLen = 80000
  const truncated = sourceCode.length > maxLen
    ? sourceCode.slice(0, maxLen) + '\n\n// ... [TRUNCATED - showing first ' + maxLen + ' chars]'
    : sourceCode

  const userMessage = \`Analyze this smart contract for security vulnerabilities.

Contract: \${contractName}
Chain: \${chain}
Compiler: Solidity

\`\`\`solidity
\${truncated}
\`\`\`

Provide a complete security audit in JSON format.\`

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('Empty response from MiMo')

    const parsed = JSON.parse(content)

    return {
      score: Math.max(0, Math.min(100, parsed.score || 0)),
      riskLevel: parsed.riskLevel || 'medium',
      summary: parsed.summary || 'Analysis completed.',
      findings: (parsed.findings || []).map((f: any, i: number) => ({
        id: f.id || \`F-\${String(i + 1).padStart(3, '0')}\`,
        severity: f.severity || 'info',
        title: f.title || 'Finding',
        description: f.description || '',
        line: f.line,
        recommendation: f.recommendation || '',
      })),
      categories: {
        reentrancy: parsed.categories?.reentrancy ?? 5,
        accessControl: parsed.categories?.accessControl ?? 5,
        arithmetic: parsed.categories?.arithmetic ?? 5,
        frontRunning: parsed.categories?.frontRunning ?? 5,
        centralization: parsed.categories?.centralization ?? 5,
        gasOptimization: parsed.categories?.gasOptimization ?? 5,
      },
      recommendation: parsed.recommendation || 'NEEDS REVIEW',
      modelUsed: model,
    }
  } catch (error: any) {
    // Fallback with basic pattern matching if API fails
    console.error('MiMo API error:', error.message)
    return fallbackAnalysis(sourceCode, contractName, model)
  }
}

function fallbackAnalysis(sourceCode: string, contractName: string, model: string): AuditResult {
  const findings: Finding[] = []
  let score = 85

  // Basic pattern matching as fallback
  if (sourceCode.includes('selfdestruct') || sourceCode.includes('suicide')) {
    findings.push({
      id: 'F-001', severity: 'high',
      title: 'Self-destruct Detected',
      description: 'Contract contains selfdestruct which can permanently destroy the contract and send remaining ETH to an arbitrary address.',
      recommendation: 'Remove selfdestruct unless absolutely necessary for upgradeability.',
    })
    score -= 15
  }

  if (sourceCode.includes('tx.origin')) {
    findings.push({
      id: 'F-002', severity: 'medium',
      title: 'tx.origin Usage',
      description: 'Using tx.origin for authorization is vulnerable to phishing attacks.',
      recommendation: 'Use msg.sender instead of tx.origin for authentication.',
    })
    score -= 10
  }

  if (sourceCode.includes('.call{value:') && !sourceCode.includes('ReentrancyGuard')) {
    findings.push({
      id: 'F-003', severity: 'high',
      title: 'Potential Reentrancy',
      description: 'External calls with ETH transfer detected without ReentrancyGuard.',
      recommendation: 'Apply checks-effects-interactions pattern or use ReentrancyGuard.',
    })
    score -= 15
  }

  if (sourceCode.includes('mint') && !sourceCode.includes('maxSupply') && !sourceCode.includes('cap')) {
    findings.push({
      id: 'F-004', severity: 'medium',
      title: 'Unlimited Minting',
      description: 'Mint function found without supply cap. Could be used for inflation attack.',
      recommendation: 'Add a maximum supply cap or make minting governance-controlled.',
    })
    score -= 10
  }

  if (sourceCode.includes('blacklist') || sourceCode.includes('isBlacklisted')) {
    findings.push({
      id: 'F-005', severity: 'medium',
      title: 'Blacklist Functionality',
      description: 'Contract has blacklist capability which can freeze user funds.',
      recommendation: 'Ensure blacklist has governance oversight and timelock.',
    })
    score -= 5
  }

  if (findings.length === 0) {
    findings.push({
      id: 'F-001', severity: 'info',
      title: 'Basic Pattern Analysis',
      description: 'Automated fallback analysis found no obvious vulnerabilities. Note: This is a basic check only — a full MiMo AI audit is recommended.',
      recommendation: 'Configure OPENROUTER_API_KEY for full AI-powered analysis.',
    })
  }

  const riskLevel = score >= 80 ? 'low' : score >= 60 ? 'medium' : score >= 40 ? 'high' : 'critical'

  return {
    score: Math.max(0, score),
    riskLevel,
    summary: \`Fallback analysis of \${contractName}. \${findings.length} potential issues found. For comprehensive analysis, configure the MiMo API key.\`,
    findings,
    categories: {
      reentrancy: sourceCode.includes('.call{value:') ? 7 : 2,
      accessControl: sourceCode.includes('onlyOwner') ? 3 : 6,
      arithmetic: 3,
      frontRunning: 4,
      centralization: sourceCode.includes('onlyOwner') ? 6 : 3,
      gasOptimization: 4,
    },
    recommendation: score >= 70 ? 'SAFE TO DEPLOY' : 'NEEDS REVIEW',
    modelUsed: model + ' (fallback)',
  }
}
