"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trophy, Crown, Medal, Award, Sparkles, TrendingUp, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string
  avatar: string | null
  respectPoints: number
  badgeLevel: string
  articlesRead: number
  likesReceived: number
}

export function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<"all" | "weekly" | "monthly">("all")

  useEffect(() => {
    fetchLeaderboard()
  }, [period])

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true)
      const url = `/api/leaderboard?period=${period}&limit=50`
      const res = await fetch(url)
      
      if (res.ok) {
        const data = await res.json()
        setEntries(data.leaderboard || [])
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const topThree = entries.slice(0, 3)
  const others = entries.slice(3)

  const getBadgeColor = (level: string) => {
    switch (level) {
      case "Diamond": return "text-cyan-300 ring-cyan-300 shadow-[0_0_20px_rgba(185,242,255,0.5)]"
      case "Gold": return "text-yellow-400 ring-yellow-400 shadow-[0_0_20px_rgba(255,215,0,0.5)]"
      case "Silver": return "text-zinc-300 ring-zinc-300 shadow-[0_0_20px_rgba(192,192,192,0.5)]"
      case "Copper": return "text-orange-500 ring-[#b87333] shadow-[0_0_20px_rgba(184,115,51,0.5)]"
      default: return "text-zinc-500 ring-zinc-500"
    }
  }

  if (isLoading) {
    return <LeaderboardSkeleton />
  }

  return (
    <div className="flex flex-col w-full pb-20">
      {/* Header */}
      <div className="px-6 py-10">
        <h1 className="text-4xl font-black tracking-tight mb-2">Leaderboard</h1>
        <p className="text-muted-foreground text-lg">The most respected scholars in the Mantoric community.</p>
        
        {/* Period Selector */}
        <div className="flex gap-2 mt-8">
          {(["all", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all uppercase tracking-widest",
                period === p
                  ? "bg-foreground text-background"
                  : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 mb-12">
        {topThree.map((entry, index) => (
          <Link 
            href={`/profile/${entry.username}`}
            key={entry.userId}
            className={cn(
              "relative group rounded-3xl p-6 transition-all duration-500 hover:scale-[1.02]",
              index === 0 ? "bg-gradient-to-br from-yellow-500/20 via-black to-black border border-yellow-500/30 md:order-2 md:scale-110" : 
              index === 1 ? "bg-gradient-to-br from-zinc-400/20 via-black to-black border border-zinc-400/30 md:order-1" :
              "bg-gradient-to-br from-amber-700/20 via-black to-black border border-amber-700/30 md:order-3"
            )}
          >
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                {index === 0 && <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]" />}
                <div className={cn(
                  "w-24 h-24 rounded-full overflow-hidden ring-4 ring-offset-4 ring-offset-black",
                  index === 0 ? "ring-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.4)]" :
                  index === 1 ? "ring-zinc-400 shadow-[0_0_30px_rgba(161,161,170,0.4)]" :
                  "ring-amber-700 shadow-[0_0_30px_rgba(184,115,51,0.4)]"
                )}>
                  {entry.avatar ? (
                    <Image src={entry.avatar} alt={entry.displayName} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center text-2xl font-bold">
                      {entry.displayName[0]}
                    </div>
                  )}
                </div>
                <div className={cn(
                  "absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center font-black text-xl border-4 border-black",
                  index === 0 ? "bg-yellow-400 text-black" :
                  index === 1 ? "bg-zinc-400 text-black" :
                  "bg-amber-700 text-white"
                )}>
                  {entry.rank}
                </div>
              </div>
              
              <h2 className="text-xl font-black mb-1">{entry.displayName}</h2>
              <p className="text-muted-foreground text-sm mb-4">@{entry.username}</p>
              
              <div className="bg-secondary/50 rounded-2xl px-4 py-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="font-black text-lg">{entry.respectPoints.toLocaleString()}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Respect</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Others List */}
      <div className="px-6">
        <div className="flex flex-col space-y-1">
          {others.map((entry) => (
            <Link
              key={entry.userId}
              href={`/profile/${entry.username}`}
              className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-secondary/30 group"
            >
              <div className="w-8 text-center font-black text-muted-foreground group-hover:text-foreground">
                {entry.rank}
              </div>
              
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-secondary">
                {entry.avatar ? (
                  <Image src={entry.avatar} alt={entry.displayName} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold">
                    {entry.displayName[0]}
                  </div>
                )}
              </div>
              
              <div className="flex-1 flex flex-col">
                <span className="font-bold text-foreground">{entry.displayName}</span>
                <span className="text-xs text-muted-foreground">@{entry.username}</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("px-3 py-1 font-bold", getBadgeColor(entry.badgeLevel))}>
                  {entry.badgeLevel}
                </Badge>
              </div>

              <div className="text-right min-w-[100px]">
                <div className="flex items-center justify-end gap-1.5 font-black text-foreground">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  {entry.respectPoints.toLocaleString()}
                </div>
                <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Respect Points</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="px-6 py-10 w-full">
      <Skeleton className="h-12 w-64 mb-4" />
      <Skeleton className="h-6 w-96 mb-12" />
      <div className="grid grid-cols-3 gap-6 mb-12">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
