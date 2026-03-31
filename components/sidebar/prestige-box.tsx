"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, Sparkles, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface PrestigeBoxProps {
  badgeLevel?: "Newbie" | "Copper" | "Silver" | "Gold" | "Diamond"
  respectPoints?: number
  bannerUrl?: string
  isFloating?: boolean
}

const badgeColors = {
  Newbie: "#525252",
  Copper: "#b87333",
  Silver: "#c0c0c0",
  Gold: "#ffd700",
  Diamond: "#b9f2ff",
}

const badgeGlows = {
  Newbie: "shadow-[0_0_15px_rgba(82,82,82,0.4)]",
  Copper: "shadow-[0_0_15px_rgba(184,115,51,0.4)]",
  Silver: "shadow-[0_0_15px_rgba(192,192,192,0.4)]",
  Gold: "shadow-[0_0_15px_rgba(255,215,0,0.4)]",
  Diamond: "shadow-[0_0_15px_rgba(185,242,255,0.4)]",
}

export function PrestigeBox({ badgeLevel: initialBadgeLevel, respectPoints: initialRespectPoints, bannerUrl: initialBannerUrl, isFloating }: PrestigeBoxProps) {
  const { user, isLoaded } = useUser()
  const [mounted, setMounted] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [stats, setStats] = useState({
    badgeLevel: initialBadgeLevel || "Newbie",
    rank: "Newbie",
    respectPoints: initialRespectPoints || 0,
    streak: 0,
    bannerUrl: initialBannerUrl || ""
  })

  useEffect(() => {
    setMounted(true)
    if (isLoaded && user?.username) {
      fetch(`/api/user/profile?username=${user.username}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setStats({
              badgeLevel: data.user.badgeLevel || "Newbie",
              rank: data.user.rank || "Newbie",
              respectPoints: data.user.respectPoints || 0,
              streak: data.user.streak || 0,
              bannerUrl: data.user.bannerUrl || ""
            })
          }
        })
        .catch(err => console.error("Failed to fetch profile stats:", err))
    }
  }, [isLoaded, user?.username])

  if (!mounted || !isLoaded) {
    return <PrestigeBoxSkeleton />
  }

  if (!user) {
    return null
  }

  const { badgeLevel, rank, respectPoints, bannerUrl: banner, streak } = stats
  const displayName = user.fullName || user.username || "Scholar"
  const username = user.username || "user"
  const avatarUrl = user.imageUrl

  // Dynamic Respect Color
  const getRespectColor = (points: number) => {
    if (points >= 500) return "text-[#E5E4E2]" // Diamond
    if (points >= 100) return "text-[#D4AF37]" // Gold
    return "text-[#C0C0C0]" // Silver
  }

  const getRankBadgeColor = (rankStr: string) => {
    const r = rankStr.toLowerCase()
    if (r === "caesar") return "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] border-red-400/50"
    if (r === "senator") return "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.6)] border-purple-400/50"
    if (r === "gladiator") return "bg-zinc-700 text-white border-zinc-500/50"
    if (r === "praetor") return "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)] border-blue-400/50"
    return "bg-zinc-800 text-zinc-400 border-zinc-700"
  }

  const getRankIcon = (rankStr: string) => {
    const r = rankStr.toLowerCase()
    if (r === "caesar") return <Crown className="w-3 h-3 mr-1 fill-current" />
    if (r === "senator") return <Landmark className="w-3 h-3 mr-1 fill-current" />
    if (r === "gladiator") return <Award className="w-3 h-3 mr-1 fill-current" />
    return null
  }

  const content = (
    <div 
      className={cn(
        "relative overflow-hidden group/prestige",
        isFloating 
          ? "rounded-[2rem] bg-black/80 backdrop-blur-xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.5)]" 
          : "rounded-[2rem] bg-transparent"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banner Area - Shorter height, no hover effects */}
      <div className={cn(
        "relative w-full overflow-hidden h-24"
      )}>
        {banner ? (
          <Image
            src={banner}
            alt="Profile Banner"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        
        {/* Authority Badge Overlay - Positioned on the top right of the banner area or edge */}
        {(rank !== "Newbie" || badgeLevel !== "Newbie") && (
          <div className={cn(
            "absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center border backdrop-blur-md z-10",
            getRankBadgeColor(rank !== "Newbie" ? rank : badgeLevel)
          )}>
            {getRankIcon(rank !== "Newbie" ? rank : badgeLevel)}
            {rank !== "Newbie" ? rank : badgeLevel}
          </div>
        )}
      </div>

      {/* Profile Info Overlay Wrapper */}
      <div className={cn(
        "relative px-4 pb-5 -mt-8"
      )}>
        <div className="flex items-end gap-2.5 mb-3">
          {/* Avatar - Shrunk size */}
          <div 
            className={cn(
              "relative rounded-full p-0.5 transition-all duration-500 shrink-0",
              "w-12 h-12",
              "bg-gradient-to-br from-white/20 to-transparent",
              badgeLevel === "Newbie" && "shadow-[0_0_15px_rgba(107,114,128,0.2)]",
              badgeLevel === "Copper" && "shadow-[0_0_20px_rgba(184,115,51,0.3)]",
              badgeLevel === "Silver" && "shadow-[0_0_20px_rgba(192,192,192,0.3)]",
              badgeLevel === "Gold" && "shadow-[0_0_25px_rgba(255,215,0,0.4)]",
              badgeLevel === "Diamond" && "shadow-[0_0_30px_rgba(185,242,255,0.5)]"
            )}
          >
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-black">
              <Image
                src={avatarUrl}
                alt={displayName}
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="flex flex-col min-w-0 pb-0.5">
            <h3 className="font-bold text-base text-white tracking-tight truncate drop-shadow-md leading-tight">
              {displayName}
            </h3>
            <p className="text-[9px] text-zinc-500 font-medium leading-none">@{username}</p>
          </div>
        </div>

        {/* Stats Row: Respect & Streak - Professional Grid */}
        <div className="flex items-center gap-5 mt-3">
          {/* Respect Count */}
          <div className="flex items-center gap-2 group/stat">
            <div className="p-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Sparkles className="w-3 h-3 text-purple-400 fill-purple-400/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold text-zinc-500 leading-none tracking-widest mb-0.5">Respect</span>
              <span className={cn("text-sm font-black tabular-nums leading-none", getRespectColor(respectPoints))}>
                {respectPoints.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-2 group/stat">
            <div className="p-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
              <Zap className="w-3 h-3 text-orange-400 fill-orange-400/20" />
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-bold text-zinc-500 leading-none tracking-widest mb-0.5">Streak</span>
              <span className="text-sm font-black text-white tabular-nums leading-none">
                {streak}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    isFloating ? (
      <Link href={`/profile/${username}`} className="block cursor-pointer">
        {content}
      </Link>
    ) : (
      content
    )
  )
}

function PrestigeBoxSkeleton() {
  return (
    <div className="rounded-xl bg-[#0a0a0a] overflow-hidden">
      <Skeleton className="h-20 w-full" />
      <div className="px-4 -mt-8 pb-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <Skeleton className="h-6 w-32 mt-2" />
        <Skeleton className="h-4 w-24 mt-1" />
        <Skeleton className="h-4 w-20 mt-3" />
      </div>
    </div>
  )
}
