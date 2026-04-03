"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trophy, Crown, Medal, Award, Sparkles, TrendingUp, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

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

export function LeaderboardWidget() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<"all" | "weekly" | "monthly">("all")

  useEffect(() => {
    fetchLeaderboard()
  }, [period])

  const fetchLeaderboard = async () => {
    try {
      const url = `/api/leaderboard?period=${period}&limit=10`
      console.log("[DEBUG] Fetching leaderboard:", url)
      
      const res = await fetch(url)
      console.log("[DEBUG] Leaderboard status:", res.status)
      
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("[DEBUG] Leaderboard non-JSON response:", text.substring(0, 200))
        return
      }
      
      if (res.ok) {
        const data = await res.json()
        setEntries(data.leaderboard || [])
      }
    } catch (error) {
      console.error("[DEBUG] Failed to fetch leaderboard:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-4 w-4 text-yellow-500" />
      case 2: return <Medal className="h-4 w-4 text-zinc-400" />
      case 3: return <Award className="h-4 w-4 text-amber-600" />
      default: return <span className="text-xs font-bold text-muted-foreground w-4 text-center">{rank}</span>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return "bg-yellow-500/10 border-yellow-500/30"
      case 2: return "bg-zinc-400/10 border-zinc-400/30"
      case 3: return "bg-amber-600/10 border-amber-600/30"
      default: return "bg-card border-border/30"
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card p-4 border border-border/50 shadow-sm">
        <div className="h-6 w-32 bg-secondary rounded mb-4 animate-pulse" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-12 bg-secondary rounded mb-2 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-card border border-border/50 shadow-md overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <h3 className="font-bold text-foreground">Top Scholars</h3>
          </div>
          <Link 
            href="/leaderboard" 
            className="text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            View All
          </Link>
        </div>
        
        {/* Period Tabs */}
        <div className="flex gap-1 mt-3">
          {(["all", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={cn(
                "text-[10px] px-2 py-1 rounded-full font-medium transition-all capitalize",
                period === p
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:bg-secondary/50"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2">
        {entries.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground text-sm">
            No data available
          </div>
        ) : (
          entries.map((entry) => (
            <Link
              key={entry.userId}
              href={`/profile/${entry.username}`}
              className={cn(
                "flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-secondary/50 mb-1",
                getRankStyle(entry.rank)
              )}
            >
              <div className="flex items-center justify-center w-6">
                {getRankIcon(entry.rank)}
              </div>
              
              {/* Avatar */}
              <div className="relative h-9 w-9 overflow-hidden rounded-full bg-accent shrink-0">
                {entry.avatar ? (
                  <Image
                    src={entry.avatar}
                    alt={entry.displayName}
                    fill
                    className="object-cover"
                    sizes="36px"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold">
                    {entry.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-foreground truncate">
                    {entry.displayName}
                  </span>
                  <Badge className="text-[9px] px-1 py-0 h-4 bg-secondary">
                    {entry.badgeLevel}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">@{entry.username}</span>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-sm font-bold text-purple-400">
                  <Sparkles className="h-3 w-3" />
                  {entry.respectPoints.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {entry.likesReceived} likes
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
