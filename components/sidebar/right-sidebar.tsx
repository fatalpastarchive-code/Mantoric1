"use client"

import { TrendingUp, Sparkles, Trophy, Info, ExternalLink, ArrowUpRight } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { DailyAxiom } from "@/components/widgets/daily-axiom"
import { MarketWidget } from "@/components/widgets/market-widget"
import { TrendingArticlesWidget } from "@/components/widgets/trending-articles"
import { BestEntriesWidget } from "@/components/widgets/best-entries"
import { PrestigeBox } from "./prestige-box"
import { SupportMantoricBox } from "./support-mantoric-box"
import { SupportInterestBox } from "./support-interest-box"
import { cn } from "@/lib/utils"

interface RightSidebarProps {
  category?: string
  showBestEntries?: boolean
}

export function RightSidebar({ category, showBestEntries = false }: RightSidebarProps) {
  const { isSignedIn } = useUser()
  
  // Map category slugs to proper names for the finance widget
  const isFinance = category === "finance-career" || category === "finance" || category === "business"

  return (
    <div className="flex flex-col gap-2">
      {/* Support Interest Box - Intent Collection */}
      <SupportInterestBox />

      {/* Daily Axiom - Always visible */}
      <DailyAxiom />

      {/* Category Specific Widget - Finance gets Market */}
      {isFinance && <MarketWidget />}

      {/* Best Entries for Forum, Trending Articles for others */}
      {showBestEntries ? (
        <BestEntriesWidget />
      ) : (
        <TrendingArticlesWidget category={category} limit={3} />
      )}
    </div>
  )
}
