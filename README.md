# 🛡️ MiMo Contract Auditor

AI-powered smart contract vulnerability scanner powered by **Xiaomi MiMo**.

Paste any verified contract address → get a comprehensive security report with vulnerability analysis, risk scoring, and actionable recommendations.

## ✨ Features

- 🔍 **Deep Analysis** — MiMo AI detects reentrancy, rug pulls, honeypots, hidden mints, centralization risks
- 📊 **Safety Score** — 0-100 rating with risk category breakdown
- 🔗 **Multi-Chain** — Ethereum, BSC, Polygon, Arbitrum, Optimism, Base, Avalanche
- ⚡ **Fast** — Full report in ~15-30 seconds
- 🎨 **Beautiful UI** — Dark theme, responsive, glassmorphism design
- 🔗 **Shareable Reports** — Each report gets a unique URL

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/mimo-contract-auditor.git
cd mimo-contract-auditor
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required: Etherscan API Key (free at https://etherscan.io/apis)
ETHERSCAN_API_KEY=your_key_here

# Required: OpenRouter API Key (for MiMo model access)
# Get yours at https://openrouter.ai/keys
OPENROUTER_API_KEY=your_key_here

# Optional: Override MiMo model
MIMO_MODEL=xiaomi/mimo-v2.5-pro
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables (`ETHERSCAN_API_KEY`, `OPENROUTER_API_KEY`)
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/mimo-contract-auditor)

## 🏗️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **AI Model:** Xiaomi MiMo via OpenRouter
- **Styling:** Tailwind CSS
- **Contract Data:** Etherscan API
- **Hosting:** Vercel

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── analyze/route.ts    # Main analysis endpoint
│   │   └── report/[id]/route.ts # Report retrieval
│   ├── report/[id]/page.tsx    # Report view
│   ├── layout.tsx              # Root layout + nav
│   ├── page.tsx                # Landing page
│   └── globals.css             # Tailwind + custom styles
├── components/
│   ├── ScoreRing.tsx           # Circular score gauge
│   ├── CategoryBar.tsx         # Risk category bars
│   ├── FindingCard.tsx         # Individual finding display
│   ├── SeverityBadge.tsx       # Severity color badges
│   └── LoadingState.tsx        # Loading animation
└── lib/
    ├── etherscan.ts            # Multi-chain contract source fetcher
    ├── mimo.ts                 # MiMo AI analysis client
    └── reports.ts              # In-memory report storage
```

## 🤖 How It Works

1. User enters a contract address and selects a chain
2. Server fetches verified source code from Etherscan/BSCScan/etc
3. Source code is sent to MiMo for deep analysis
4. MiMo returns structured vulnerability report (JSON)
5. Report is displayed with score, findings, and recommendations

## 📝 Built for MiMo 100T Program

This project demonstrates MiMo's capabilities in:
- **Code reasoning** — Understanding complex Solidity patterns
- **Security analysis** — Detecting subtle vulnerability patterns
- **Structured output** — Generating actionable JSON reports
- **Domain expertise** — Blockchain security knowledge

## License

MIT
