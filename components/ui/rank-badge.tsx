"use client"

import { Crown, Landmark, ShieldCheck, Swords, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/lib/db/schema"

interface RankBadgeProps {
  role: UserRole
  className?: string
  size?: "sm" | "md" | "lg"
  showLabel?: boolean
}

const roleConfigs = {
  CAESAR: {
    icon: Crown,
    color: "bg-[#6D28D9]",
    aura: "bg-[#6D28D9]/10 border-[#D4AF37]/30",
    textColor: "text-[#D4AF37]",
    label: "Caesar"
  },
  SENATOR: {
    icon: Landmark,
    color: "bg-white",
    aura: "bg-white/10 border-white/30",
    textColor: "text-white",
    label: "Senator"
  },
  LEGATE: {
    icon: ShieldCheck,
    color: "bg-[#B91C1C]",
    aura: "bg-[#B91C1C]/10 border-[#B91C1C]/30",
    textColor: "text-[#B91C1C]",
    label: "Legate"
  },
  GLADIATOR: {
    icon: Swords,
    color: "bg-[#1D4ED8]",
    aura: "bg-[#1D4ED8]/10 border-[#1D4ED8]/30",
    textColor: "text-[#1D4ED8]",
    label: "Gladiator"
  },
  CITIZEN: {
    icon: UserIcon,
    color: "bg-[#475569]",
    aura: "bg-[#475569]/10 border-[#475569]/30",
    textColor: "text-[#475569]",
    label: "Citizen"
  }
}

export function RankBadge({ role, className, size = "md", showLabel = false }: RankBadgeProps) {
  const config = roleConfigs[role] || roleConfigs.CITIZEN
  const Icon = config.icon

  const outerSizes = {
    sm: "h-6 w-6 p-1",
    md: "h-8 w-8 p-1.5",
    lg: "h-11 w-11 p-2"
  }

  const iconSizes = {
    sm: "h-2 w-2",
    md: "h-3.5 w-3.5",
    lg: "h-5 w-5"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div 
        className={cn(
          "rounded-xl flex items-center justify-center transition-all border",
          config.aura,
          outerSizes[size],
          role === "CAESAR" && "shadow-[0_0_15px_rgba(212,175,55,0.2)]"
        )}
      >
        <div className={cn(
            "rounded-lg flex items-center justify-center w-full h-full shadow-inner",
            config.color
        )}>
            <Icon className={cn(
                role === "SENATOR" ? "text-black" : "text-white", 
                iconSizes[size], 
                role === "CAESAR" && "fill-current text-white"
            )} />
        </div>
      </div>
      {showLabel && (
        <span className={cn(
          "text-[10px] font-black uppercase tracking-[0.2em]",
          config.textColor
        )}
        >
          {config.label}
        </span>
      )}
    </div>
  )
}
