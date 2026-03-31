"use client"

import { cn } from "@/lib/utils"
import { AUTHORITY_CONFIGS, RESPECT_CONFIGS, AuthorityRank, RespectRank } from "@/lib/ranks"

interface EliteBadgeProps {
  rank: string
  type?: "authority" | "respect"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function EliteBadge({ rank, type, size = "md", className }: EliteBadgeProps) {
  if (!rank) return null
  const normalizedRank = rank.toLowerCase()
  
  // Try to find in authority first if no type specified
  let config = (type === "authority" || !type) 
    ? AUTHORITY_CONFIGS[normalizedRank as AuthorityRank] 
    : null
  
  // If not found and no type or type is respect, check respect configs
  if (!config && (type === "respect" || !type)) {
    config = RESPECT_CONFIGS[normalizedRank as RespectRank]
  }

  if (!config) return null

  const Icon = config.icon

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[8px] gap-1",
    md: "px-3 py-1 text-[10px] gap-1.5",
    lg: "px-4 py-1.5 text-[12px] gap-2",
  }

  const iconSizeClasses = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full font-black tracking-widest text-white uppercase",
        config.color,
        config.glowColor,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn(iconSizeClasses[size], "fill-white/20")} />
      <span>{config.label}</span>
    </div>
  )
}
