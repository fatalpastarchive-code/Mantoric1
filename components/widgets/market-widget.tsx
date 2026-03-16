"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, RefreshCw, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface MarketData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  currency: string
}

// Major trading pairs and commodities for display
const TRACKED_ASSETS = [
  { symbol: "EURUSD", name: "EUR/USD", type: "forex" },
  { symbol: "GBPUSD", name: "GBP/USD", type: "forex" },
  { symbol: "USDJPY", name: "USD/JPY", type: "forex" },
  { symbol: "BTC", name: "Bitcoin", type: "crypto" },
  { symbol: "ETH", name: "Ethereum", type: "crypto" },
  { symbol: "GC", name: "Gold", type: "commodity" },
  { symbol: "SI", name: "Silver", type: "commodity" },
  { symbol: "CL", name: "Crude Oil", type: "commodity" },
]

export function MarketWidget() {
  const [markets, setMarkets] = useState<MarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Simulate market data with realistic mock values
  // In production, this would fetch from an API like Alpha Vantage, Finnhub, or CoinGecko
  const fetchMarketData = async () => {
    setLoading(true)
    
    // Simulated realistic market data
    const mockData: MarketData[] = [
      { symbol: "EURUSD", name: "EUR/USD", price: 1.0845, change: 0.0023, changePercent: 0.21, currency: "USD" },
      { symbol: "GBPUSD", name: "GBP/USD", price: 1.2632, change: -0.0012, changePercent: -0.09, currency: "USD" },
      { symbol: "USDJPY", name: "USD/JPY", price: 151.45, change: 0.35, changePercent: 0.23, currency: "JPY" },
      { symbol: "BTC", name: "Bitcoin", price: 67234.50, change: 1234.20, changePercent: 1.87, currency: "USD" },
      { symbol: "ETH", name: "Ethereum", price: 3521.80, change: -45.30, changePercent: -1.27, currency: "USD" },
      { symbol: "GC", name: "Gold", price: 2184.60, change: 12.40, changePercent: 0.57, currency: "USD" },
      { symbol: "SI", name: "Silver", price: 24.85, change: -0.15, changePercent: -0.60, currency: "USD" },
      { symbol: "CL", name: "Crude Oil", price: 81.45, change: 0.85, changePercent: 1.05, currency: "USD" },
    ]
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setMarkets(mockData)
    setLastUpdate(new Date())
    setLoading(false)
  }

  useEffect(() => {
    fetchMarketData()
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchMarketData, 60000)
    return () => clearInterval(interval)
  }, [])

  const formatPrice = (price: number, symbol: string) => {
    if (symbol === "BTC" || symbol === "ETH") {
      return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  }

  const formatChange = (change: number, changePercent: number) => {
    const isUp = change >= 0
    return {
      value: `${isUp ? "+" : ""}${change.toFixed(2)}`,
      percent: `${isUp ? "+" : ""}${changePercent.toFixed(2)}%`,
      isUp
    }
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-emerald-950/20 to-zinc-900/50 p-4 border border-emerald-500/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <span className="text-[13px] font-bold uppercase tracking-wider text-emerald-400/80">Market Pulse</span>
        </div>
        <button 
          onClick={fetchMarketData}
          disabled={loading}
          className="p-1.5 rounded-lg hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 text-emerald-400/60", loading && "animate-spin")} />
        </button>
      </div>
      
      <div className="space-y-2">
        {markets.slice(0, 5).map((m) => {
          const change = formatChange(m.change, m.changePercent)
          return (
            <div 
              key={m.symbol} 
              className="flex items-center justify-between py-2 border-b border-border/10 last:border-0 group cursor-pointer hover:bg-emerald-500/5 -mx-2 px-2 rounded-lg transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">{m.name}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.symbol}</span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-sm font-mono font-semibold text-foreground">
                  {formatPrice(m.price, m.symbol)}
                </span>
                <div className={cn(
                  "flex items-center gap-1 text-[11px] font-bold",
                  change.isUp ? "text-emerald-400" : "text-red-400"
                )}>
                  {change.isUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {change.percent}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-3 pt-3 border-t border-emerald-500/10 flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <button className="text-[11px] font-bold text-emerald-400/80 hover:text-emerald-400 transition-colors flex items-center gap-1">
          Full Terminal
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    </div>
  )
}
