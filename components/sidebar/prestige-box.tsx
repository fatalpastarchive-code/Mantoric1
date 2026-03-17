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
  const [isHovered, setIsHovered] = useState(false)
  const [stats, setStats] = useState({
    badgeLevel: initialBadgeLevel || "Newbie",
    respectPoints: initialRespectPoints || 0,
    streak: 0,
    bannerUrl: initialBannerUrl || (user?.publicMetadata?.banner as string) || "/default-banner.jpg"
  })

  useEffect(() => {
    if (isFloating && isLoaded && user?.username) {
      fetch(`/api/user/profile?username=${user.username}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setStats({
              badgeLevel: data.user.badgeLevel || "Newbie",
              respectPoints: data.user.respectPoints || 0,
              streak: data.user.streak || 0,
              bannerUrl: (user?.publicMetadata?.banner as string) || "/default-banner.jpg"
            })
          }
        })
        .catch(err => console.error("Failed to fetch floating profile stats:", err))
    }
  }, [isFloating, isLoaded, user?.username, user?.publicMetadata?.banner])

  if (!isLoaded) {
    return <PrestigeBoxSkeleton />
  }

  if (!user) {
    return null
  }

  const { badgeLevel, respectPoints, bannerUrl: banner, streak } = stats
  const displayName = user.fullName || user.username || "Scholar"
  const username = user.username || "user"
  const avatarUrl = user.imageUrl

  return (
    <div 
      className={cn(
        "relative overflow-hidden transition-all duration-500",
        isFloating 
          ? "rounded-2xl bg-black/80 backdrop-blur-xl border-none shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:scale-[1.02]" 
          : "rounded-xl bg-transparent group/prestige"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banner with Gradient Transition */}
      <div className={cn(
        "relative w-full overflow-hidden",
        isFloating ? "h-20" : "h-24"
      )}>
        <Image
          src={banner}
          alt="Profile Banner"
          fill
          className="object-cover transition-transform duration-500 group-hover/prestige:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black" />
      </div>

      {/* Avatar & Content Wrapper */}
      <div className={cn(
        "relative px-4 pb-6 bg-gradient-to-b from-black to-transparent",
        isFloating ? "-mt-8" : "-mt-10"
      )}>
        <div className="flex items-center gap-4">
          {/* Avatar with Neon Glow */}
          <div 
            className={cn(
              "relative rounded-full overflow-hidden ring-2 ring-offset-4 ring-offset-black transition-all duration-500 shrink-0",
              isFloating ? "w-14 h-14" : "w-20 h-20",
              badgeLevel === "Newbie" && "ring-gray-500 shadow-[0_0_15px_rgba(107,114,128,0.4)]",
              badgeLevel === "Copper" && "ring-[#b87333] shadow-[0_0_20px_rgba(184,115,51,0.5)]",
              badgeLevel === "Silver" && "ring-[#c0c0c0] shadow-[0_0_20px_rgba(192,192,192,0.5)]",
              badgeLevel === "Gold" && "ring-[#ffd700] shadow-[0_0_25px_rgba(255,215,0,0.6)]",
              badgeLevel === "Diamond" && "ring-[#b9f2ff] shadow-[0_0_30px_rgba(185,242,255,0.7)]"
            )}
          >
            <Image
              src={avatarUrl}
              alt={displayName}
              fill
              className="object-cover"
            />
          </div>

          {isFloating && (
            <div className="flex flex-col min-w-0 pt-4">
              <h3 className="font-bold text-base text-foreground truncate">{displayName}</h3>
              <p className="text-[10px] text-muted-foreground font-medium opacity-70 leading-none">@{username}</p>
            </div>
          )}
        </div>

        {/* User Identity (Non-floating only) */}
        {!isFloating && (
          <div className="mt-4 space-y-0.5">
            <Link href={`/profile/${username}`} className="block">
              <h3 
                className={cn(
                  "font-bold text-xl tracking-tight transition-colors",
                  badgeLevel === "Gold" && "gradient-gold",
                  badgeLevel === "Silver" && "gradient-silver",
                  badgeLevel === "Copper" && "gradient-copper",
                  badgeLevel === "Diamond" && "gradient-diamond",
                  badgeLevel === "Newbie" && "text-neutral-200"
                )}
              >
                {displayName}
              </h3>
              <p className="text-xs text-muted-foreground font-medium opacity-70">@{username}</p>
            </Link>
          </div>
        )}

        {/* Stats Row: Respect & Badge & Streak */}
        <div className={cn(
          "flex items-center gap-3",
          isFloating ? "mt-4" : "mt-5"
        )}>
          {/* Respect Count */}
          <div className={cn(
            "flex items-center gap-1.5 transition-all duration-300",
            isHovered && "drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]"
          )}>
            <div className="p-1 rounded-md bg-purple-500/10">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none tracking-wider">Respect</span>
              <span className="text-sm font-black text-foreground tabular-nums">
                {respectPoints.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-orange-500/10">
              <Zap className="w-3.5 h-3.5 text-orange-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none tracking-wider">Streak</span>
              <span className="text-sm font-black text-foreground tabular-nums">
                {streak}
              </span>
            </div>
          </div>

          {/* Badge Display */}
          {!isFloating && (
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-md bg-white/5">
                <Award 
                  className="w-3.5 h-3.5" 
                  style={{ color: badgeColors[badgeLevel as keyof typeof badgeColors] }}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none tracking-wider">Rank</span>
                <span 
                  className="text-sm font-black"
                  style={{ color: badgeColors[badgeLevel as keyof typeof badgeColors] }}
                >
                  {badgeLevel}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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
