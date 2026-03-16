"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface PrestigeBoxProps {
  badgeLevel: "Newbie" | "Copper" | "Silver" | "Gold" | "Diamond"
  respectPoints: number
  bannerUrl?: string
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

export function PrestigeBox({ badgeLevel, respectPoints, bannerUrl }: PrestigeBoxProps) {
  const { user, isLoaded } = useUser()
  const [isHovered, setIsHovered] = useState(false)

  if (!isLoaded) {
    return <PrestigeBoxSkeleton />
  }

  if (!user) {
    return null
  }

  const displayName = user.fullName || user.username || "Scholar"
  const username = user.username || "user"
  const avatarUrl = user.imageUrl
  const banner = bannerUrl || "/default-banner.jpg"

  return (
    <div 
      className="relative overflow-hidden rounded-xl bg-transparent group/prestige"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Banner with Gradient Transition */}
      <div className="relative h-24 w-full overflow-hidden">
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
      <div className="relative px-4 -mt-10 pb-6 bg-gradient-to-b from-black to-transparent">
        {/* Avatar with Neon Glow */}
        <div 
          className={cn(
            "relative w-20 h-20 rounded-full overflow-hidden ring-2 ring-offset-4 ring-offset-black transition-all duration-500",
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

        {/* User Identity */}
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

        {/* Stats Row: Respect & Badge */}
        <div className="flex items-center gap-4 mt-5">
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

          {/* Badge Display */}
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-white/5">
              <Award 
                className="w-3.5 h-3.5" 
                style={{ color: badgeColors[badgeLevel] }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none tracking-wider">Rank</span>
              <span 
                className="text-sm font-black"
                style={{ color: badgeColors[badgeLevel] }}
              >
                {badgeLevel}
              </span>
            </div>
          </div>
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
