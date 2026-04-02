"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Crown, Gem, Shield, Sprout, Sparkles, User as UserIcon, Users, UserPlus, ShieldCheck, Infinity as InfinityIcon } from "lucide-react"
import { cn, formatMetric } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"
import { RankBadge } from "@/components/ui/rank-badge"

const getRespectColor = (points: number) => {
  if (points >= 1000) return "text-purple-400"
  if (points >= 500) return "text-blue-400"
  return "text-white"
}

interface HoverProfileCardProps {
  author: {
    id: string
    clerkId?: string
    name: string
    username: string
    avatar: string | null
    rank: string
    xp: number
    respectPoints?: number
    bio?: string
    isVerifiedExpert?: boolean
    expertField?: string
    axiomsCount?: number
    badges?: string[]
  }
  children: React.ReactNode
}

type LiveProfile = {
  bannerUrl: string
  followersCount: number
  followingCount: number
  respectPoints: number
  rank: string
  badgeLevel: string
  mongoId?: string
  clerkId?: string
  axiomsCount: number
  badges: string[]
}

export function HoverProfileCard({ author, children }: HoverProfileCardProps) {
  const { user, isSignedIn } = useUser()
  const [isVisible, setIsVisible] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
  const [live, setLive] = React.useState<LiveProfile | null>(null)
  const [isFollowing, setIsFollowing] = React.useState(false)
  const [isFollowLoading, setIsFollowLoading] = React.useState(false)

  const isOwnProfile = !!user?.username && user.username === author.username

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isSignedIn) return
    if (isOwnProfile) return
    const targetUserId = live?.mongoId || ""
    if (!targetUserId) return

    setIsFollowLoading(true)
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setIsFollowing(!!data.isFollowing)
      }
    } finally {
      setIsFollowLoading(false)
    }
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setIsVisible(true), 400)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setIsVisible(false), 300)
  }

  React.useEffect(() => {
    let cancelled = false
    async function load() {
      if (!isVisible) return
      try {
        const res = await fetch(`/api/user/profile?username=${encodeURIComponent(author.username)}`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        if (data?.user) {
          setLive({
            bannerUrl: data.user.bannerUrl || "",
            followersCount: data.user.followersCount || 0,
            followingCount: data.user.followingCount || 0,
            respectPoints: data.user.respectPoints || 0,
            rank: data.user.rank || "Newbie",
            badgeLevel: data.user.badgeLevel || "Newbie",
            mongoId: data.user.mongoId || "",
            clerkId: data.user.clerkId || "",
            axiomsCount: data.user.axiomsCount || 0,
            badges: data.user.badges || [],
          })
        }
      } catch {
        // ignore
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [isVisible, author.username])

  const getRankColor = (rank: string) => {
    switch (rank.toLowerCase()) {
      case "caesar": return "badge-caesar"
      case "senator": return "badge-senator text-black"
      case "diamond": return "badge-diamond"
      case "platinum": return "badge-platinum"
      case "gold": return "badge-gold"
      case "silver": return "badge-silver"
      case "bronze": return "badge-bronze"
      default: return "bg-secondary text-muted-foreground"
    }
  }

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div className="absolute left-0 top-full z-[100] mt-2 w-80 animate-in fade-in zoom-in-95 duration-200">
          <div className="overflow-hidden rounded-2xl border-none bg-black shadow-2xl">
            <div className="relative h-24 w-full overflow-hidden">
              {live?.bannerUrl ? (
                <img src={live.bannerUrl} alt="Banner" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-zinc-900" />
              )}
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between -mt-12">
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-900 ring-4 ring-black shrink-0">
                  {author.avatar ? (
                    <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-foreground">
                      {author.name.charAt(0)}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleFollow}
                  disabled={!isSignedIn || isOwnProfile || isFollowLoading || !live?.mongoId}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-colors z-10",
                    (!isSignedIn || isOwnProfile || isFollowLoading || !live?.mongoId)
                      ? "bg-zinc-900 text-muted-foreground opacity-60 cursor-not-allowed"
                      : isFollowing
                        ? "bg-zinc-800 text-foreground hover:bg-zinc-700"
                        : "bg-foreground text-background hover:bg-foreground/90"
                  )}
                  title={!isSignedIn ? "Sign in to follow" : isOwnProfile ? "You cannot follow yourself" : "Follow"}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{isFollowing ? "Following" : "Follow"}</span>
                </button>
              </div>

              <div className="flex flex-col mt-3">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${author.username}`} onClick={(e) => e.stopPropagation()} className="font-extrabold text-white text-lg">
                    {author.name}
                  </Link>
                  <div className="flex items-center">
                    <RankBadge role={(((live?.rank || author.rank) as string) || "CITIZEN").toUpperCase() as any} size="sm" showLabel />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">@{author.username}</p>
              </div>

              {(live?.badges || author.badges || []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {(live?.badges || author.badges || []).map(b => (
                    <span key={b} className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-violet-500/10 text-violet-400 border border-violet-500/20">
                      {b.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              )}

              {author.bio && (
                <p className="mt-3 text-sm text-foreground/85 line-clamp-2 leading-normal font-light italic">
                  {author.bio}
                </p>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-y-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                <div className="flex items-center gap-1.5 text-[11px] font-bold" title="Respect points received from peers">
                  <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                  <span className={cn("text-sm", getRespectColor(live?.respectPoints ?? author.respectPoints ?? 0))}>
                    {formatMetric(live?.respectPoints ?? author.respectPoints ?? 0)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold" title="Axioms measure the weight of your shared wisdom and engagement in the Arena.">
                  <InfinityIcon className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-sm text-white">
                    {formatMetric(live?.axiomsCount ?? author.axiomsCount ?? 0)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white text-xs">{formatMetric(live?.followingCount ?? 0)}</span>
                  <span>Following</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white text-xs">{formatMetric(live?.followersCount ?? 0)}</span>
                  <span>Followers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
