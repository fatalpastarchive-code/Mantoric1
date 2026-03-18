"use client"

import { TrendingUp, Sparkles, Trophy, Info, ExternalLink, ArrowUpRight } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { DailyAxiom } from "@/components/widgets/daily-axiom"
import { MarketWidget } from "@/components/widgets/market-widget"
import { TrendingArticlesWidget } from "@/components/widgets/trending-articles"
import { PrestigeBox } from "./prestige-box"
import { cn } from "@/lib/utils"

interface RightSidebarProps {
  category?: string
}

export function RightSidebar({ category }: RightSidebarProps) {
  const { isSignedIn } = useUser()
  
  // Map category slugs to proper names for the finance widget
  const isFinance = category === "finance-career" || category === "finance" || category === "business"

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Daily Axiom - Always visible */}
      <DailyAxiom />

      {/* Category Specific Widget - Finance gets Market */}
      {isFinance && <MarketWidget />}

      {/* Trending Articles / You Must Know - Dynamic based on category */}
      <TrendingArticlesWidget category={category} limit={3} />

      {/* Profile Card - Sticky Bottom */}
      {isSignedIn && (
        <div className="mt-auto sticky bottom-4">
          <PrestigeBox isFloating />
        </div>
      )}
    </div>
  )
}
