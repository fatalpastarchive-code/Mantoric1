"use client"

import { TrendingUp, Sparkles, Trophy, Info, ExternalLink, ArrowUpRight } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { DailyAxiom } from "@/components/widgets/daily-axiom"
import { MarketWidget } from "@/components/widgets/market-widget"
import { TrendingArticlesWidget } from "@/components/widgets/trending-articles"
import { LeaderboardWidget } from "@/components/widgets/leaderboard-widget"
import { cn } from "@/lib/utils"

interface RightSidebarProps {
  category?: string
}

export function RightSidebar({ category }: RightSidebarProps) {
  const { isSignedIn } = useUser()
  
  // Map category slugs to proper names for the finance widget
  const isFinance = category === "finance-career" || category === "finance" || category === "business"

  return (
    <div className="flex flex-col gap-6">
      {/* Daily Axiom - Always visible */}
      <DailyAxiom />

      {/* Category Specific Widget - Finance gets Market */}
      {isFinance && <MarketWidget />}

      {/* Trending Articles / You Must Know - Dynamic based on category */}
      <TrendingArticlesWidget category={category} limit={3} />

      {/* Leaderboard Widget */}
      {isSignedIn && <LeaderboardWidget />}

      {/* Footer Links */}
      <div className="px-4 flex flex-wrap gap-x-4 gap-y-1">
        {["Terms", "Privacy", "Cookie Policy", "Ads info", "More"].map((link) => (
          <Link 
            key={link} 
            href={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
            className="text-[12px] text-muted-foreground/50 hover:underline cursor-pointer transition-colors"
          >
            {link}
          </Link>
        ))}
        <p className="text-[12px] text-muted-foreground/50 mt-1 w-full">© 2026 Mantoric Corp.</p>
      </div>
    </div>
  )
}
