"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Sparkles, User as UserIcon, Users, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@clerk/nextjs"

interface HoverProfileCardProps {
  author: {
    id: string
    name: string
    username: string
    avatar: string | null
    rank: string
    xp: number
    respectPoints?: number
    bio?: string
    isVerifiedExpert?: boolean
    expertField?: string
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
            <div className="relative h-20 w-full overflow-hidden bg-zinc-950">
              {live?.bannerUrl ? (
                <img src={live.bannerUrl} alt="Banner" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-zinc-900 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black" />
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between -mt-10">
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-zinc-900 ring-4 ring-black">
                  {author.avatar ? (
                    <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold text-foreground">
                      {author.name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3">
                <button
                  onClick={handleFollow}
                  disabled={!isSignedIn || isOwnProfile || isFollowLoading || !live?.mongoId}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black transition-colors",
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

              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <Link href={`/profile/${author.username}`} onClick={(e) => e.stopPropagation()} className="font-extrabold text-foreground">
                    {author.name}
                  </Link>
                  {author.isVerifiedExpert && (
                    <div className="text-primary" title={author.expertField ? `Verified Expert in ${author.expertField}` : "Verified Expert"}>
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                        <path d="M22.5 12.5c0-1.58-.88-2.95-2.18-3.66.15-.44.23-.91.23-1.4 0-2.25-1.83-4.07-4.07-4.07-.49 0-.96.08-1.41.23-.71-1.3-2.08-2.18-3.66-2.18s-2.95.88-3.66 2.18c-.44-.15-.91-.23-1.4-.23-2.25 0-4.07 1.83-4.07 4.07 0 .49.08.96.23 1.41-1.3.71-2.18 2.08-2.18 3.66s.88 2.95 2.18 3.66c-.15.44-.23.91-.23 1.4 0 2.25 1.83 4.07 4.07 4.07.49 0 .96-.08 1.41-.23.71 1.3 2.08 2.18 3.66 2.18s2.95-.88 3.66-2.18c.44.15.91.23 1.4.23 2.25 0 4.07-1.83 4.07-4.07 0-.49-.08-.96-.23-1.41 1.3-.71 2.18-2.08 2.18-3.66zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">@{author.username}</p>
              </div>

              {author.bio && (
                <p className="mt-3 text-sm text-foreground/85 line-clamp-2 leading-normal">
                  {author.bio}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Badge className={cn("h-5 px-2 text-[10px] font-black border-none", getRankColor(live?.rank || author.rank))}>
                  {live?.rank || author.rank}
                </Badge>
                <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-purple-300" />
                  {(live?.respectPoints ?? author.respectPoints ?? 0).toLocaleString()} Respect
                </div>
              </div>

              <div className="mt-4 flex items-center gap-5 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span className="font-black text-foreground">{(live?.followingCount ?? 0).toLocaleString()}</span>
                  <span>Following</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UserIcon className="h-3.5 w-3.5" />
                  <span className="font-black text-foreground">{(live?.followersCount ?? 0).toLocaleString()}</span>
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
