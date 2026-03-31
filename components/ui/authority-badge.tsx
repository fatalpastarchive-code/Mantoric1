"use client"

import { Crown, Gem, Shield, Sprout, Award, Star, Zap, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

export type AuthorityRank = 
  | "caesar" 
  | "founder" 
  | "diamond" 
  | "gold" 
  | "silver" 
  | "bronze"
  | "platinum"
  | "senator"
  | "praetor"
  | "gladiator"
  | "newbie"
  | string

interface AuthorityBadgeProps {
  rank: AuthorityRank
  respectPoints?: number
  showIcon?: boolean
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const rankConfig: Record<string, {
  icon: typeof Crown
  label: string
  color: string
  bgColor: string
  borderColor: string
  glowColor: string
  textColor: string
  description: string
}> = {
  caesar: {
    icon: Crown,
    label: "Caesar",
    color: "#D4AF37",
    bgColor: "bg-gradient-to-br from-amber-500/20 to-yellow-600/10",
    borderColor: "border-amber-500/50",
    glowColor: "shadow-amber-500/20",
    textColor: "text-amber-400",
    description: "Platform Founder",
  },
  founder: {
    icon: Crown,
    label: "Founder",
    color: "#D4AF37",
    bgColor: "bg-gradient-to-br from-amber-500/20 to-yellow-600/10",
    borderColor: "border-amber-500/50",
    glowColor: "shadow-amber-500/20",
    textColor: "text-amber-400",
    description: "Elite Architect",
  },
  diamond: {
    icon: Gem,
    label: "Diamond",
    color: "#E5E4E2",
    bgColor: "bg-gradient-to-br from-cyan-500/20 to-blue-600/10",
    borderColor: "border-cyan-400/50",
    glowColor: "shadow-cyan-500/20",
    textColor: "text-cyan-300",
    description: "Revered Contributor",
  },
  gold: {
    icon: Award,
    label: "Gold",
    color: "#FFD700",
    bgColor: "bg-gradient-to-br from-yellow-500/20 to-amber-600/10",
    borderColor: "border-yellow-500/50",
    glowColor: "shadow-yellow-500/20",
    textColor: "text-yellow-400",
    description: "Respected Voice",
  },
  silver: {
    icon: Shield,
    label: "Silver",
    color: "#C0C0C0",
    bgColor: "bg-gradient-to-br from-slate-400/20 to-gray-600/10",
    borderColor: "border-slate-400/50",
    glowColor: "shadow-slate-400/20",
    textColor: "text-slate-300",
    description: "Rising Voice",
  },
  bronze: {
    icon: Star,
    label: "Bronze",
    color: "#CD7F32",
    bgColor: "bg-gradient-to-br from-orange-500/20 to-amber-700/10",
    borderColor: "border-orange-500/50",
    glowColor: "shadow-orange-500/20",
    textColor: "text-orange-400",
    description: "Active Member",
  },
  platinum: {
    icon: Zap,
    label: "Platinum",
    color: "#E5E4E2",
    bgColor: "bg-gradient-to-br from-violet-500/20 to-purple-600/10",
    borderColor: "border-violet-500/50",
    glowColor: "shadow-violet-500/20",
    textColor: "text-violet-300",
    description: "Power User",
  },
  senator: {
    icon: Shield,
    label: "Senator",
    color: "#8B5CF6",
    bgColor: "bg-gradient-to-br from-purple-500/20 to-violet-600/10",
    borderColor: "border-purple-500/50",
    glowColor: "shadow-purple-500/20",
    textColor: "text-purple-400",
    description: "Council Member",
  },
  praetor: {
    icon: Award,
    label: "Praetor",
    color: "#3B82F6",
    bgColor: "bg-gradient-to-br from-blue-500/20 to-indigo-600/10",
    borderColor: "border-blue-500/50",
    glowColor: "shadow-blue-500/20",
    textColor: "text-blue-400",
    description: "Guardian",
  },
  gladiator: {
    icon: Flame,
    label: "Gladiator",
    color: "#EF4444",
    bgColor: "bg-gradient-to-br from-red-500/20 to-rose-600/10",
    borderColor: "border-red-500/50",
    glowColor: "shadow-red-500/20",
    textColor: "text-red-400",
    description: "Warrior",
  },
  newbie: {
    icon: Sprout,
    label: "Newbie",
    color: "#4ADE80",
    bgColor: "bg-gradient-to-br from-green-500/10 to-emerald-600/5",
    borderColor: "border-green-500/30",
    glowColor: "shadow-green-500/10",
    textColor: "text-green-400",
    description: "Fresh Voice",
  },
}

function getRankFromPoints(points: number = 0): string {
  if (points >= 5000) return "founder"
  if (points >= 1500) return "diamond"
  if (points >= 500) return "gold"
  if (points >= 100) return "silver"
  return "newbie"
}

export function AuthorityBadge({ 
  rank, 
  respectPoints,
  showIcon = true, 
  showLabel = true,
  size = "sm",
  className 
}: AuthorityBadgeProps) {
  const normalizedRank = (rank || "newbie").toLowerCase()
  const effectiveRank = normalizedRank === "caesar" ? "caesar" : 
    (respectPoints !== undefined ? getRankFromPoints(respectPoints) : normalizedRank)
  
  const config = rankConfig[effectiveRank] || rankConfig.newbie
  const Icon = config.icon
  
  const sizeClasses = {
    sm: "px-2 py-1 text-[10px] gap-1",
    md: "px-3 py-1.5 text-xs gap-1.5",
    lg: "px-4 py-2 text-sm gap-2",
  }
  
  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border font-semibold tracking-wide uppercase",
        config.bgColor,
        config.borderColor,
        config.textColor,
        sizeClasses[size],
        className
      )}
      title={`${config.label} - ${config.description}`}
    >
      {showIcon && (
        <Icon 
          className={cn(
            iconSizes[size],
            effectiveRank === "caesar" && "fill-amber-500/30"
          )} 
          style={{ 
            color: config.color,
            filter: effectiveRank === "caesar" || effectiveRank === "founder" 
              ? `drop-shadow(0 0 4px ${config.color}40)` 
              : undefined 
          }}
        />
      )}
      {showLabel && <span>{config.label}</span>}
    </div>
  )
}

// Legacy helper functions for backward compatibility
export function getRankIcon(rank: string) {
  const normalizedRank = (rank || "newbie").toLowerCase()
  const config = rankConfig[normalizedRank] || rankConfig.newbie
  const Icon = config.icon
  
  return (
    <Icon 
      className="h-3 w-3 mr-1" 
      style={{ 
        color: config.color,
        fill: normalizedRank === "caesar" || normalizedRank === "founder" 
          ? `${config.color}40` 
          : normalizedRank === "diamond"
          ? `${config.color}30`
          : undefined,
        filter: normalizedRank === "caesar" || normalizedRank === "founder"
          ? `drop-shadow(0 0 5px ${config.color}50)`
          : undefined
      }} 
    />
  )
}

export function getRankBadgeStyles(rank: string): string {
  const normalizedRank = (rank || "newbie").toLowerCase()
  const config = rankConfig[normalizedRank] || rankConfig.newbie
  
  const styles: Record<string, string> = {
    caesar: `${config.textColor} font-bold [text-shadow:0_0_10px_${config.color}40]`,
    founder: `${config.textColor} font-bold [text-shadow:0_0_10px_${config.color}40]`,
    diamond: `${config.textColor} font-bold`,
    gold: `${config.textColor} font-bold`,
    silver: `${config.textColor} font-semibold`,
    bronze: `${config.textColor} font-semibold`,
    newbie: "text-green-400 font-medium",
  }
  
  return styles[normalizedRank] || "text-zinc-400"
}

export function getRankColor(rank: string): string {
  const normalizedRank = (rank || "newbie").toLowerCase()
  const config = rankConfig[normalizedRank] || rankConfig.newbie
  
  return cn(
    config.bgColor,
    config.borderColor,
    config.textColor,
    "border"
  )
}

export { getRankFromPoints }
