import { Crown, Landmark, Shield, Sword, Gem, Award, Star, Sprout, LucideIcon } from "lucide-react"

export type AuthorityRank = "caesar" | "senator" | "praetor" | "gladiator"
export type RespectRank = "diamond" | "gold" | "silver" | "newbie"

export interface BadgeConfig {
  label: string
  color: string
  icon: LucideIcon
  glowColor: string
}

export const AUTHORITY_CONFIGS: Record<AuthorityRank, BadgeConfig> = {
  caesar: {
    label: "CAESAR",
    color: "bg-[#9333ea]",
    glowColor: "shadow-[0_0_15px_rgba(147,51,234,0.6)]",
    icon: Crown,
  },
  senator: {
    label: "SENATOR",
    color: "bg-[#7c3aed]",
    glowColor: "shadow-[0_0_15px_rgba(124,58,237,0.4)]",
    icon: Landmark,
  },
  praetor: {
    label: "PRAETOR",
    color: "bg-[#2563eb]",
    glowColor: "shadow-[0_0_15px_rgba(37,99,235,0.4)]",
    icon: Shield,
  },
  gladiator: {
    label: "GLADIATOR",
    color: "bg-[#4b5563]",
    glowColor: "shadow-[0_0_10px_rgba(75,85,99,0.3)]",
    icon: Sword,
  },
}

export const RESPECT_CONFIGS: Record<RespectRank, BadgeConfig> = {
  diamond: {
    label: "DIAMOND",
    color: "bg-[#e5e7eb]",
    glowColor: "shadow-[0_0_15px_rgba(229,231,235,0.5)]",
    icon: Gem,
  },
  gold: {
    label: "GOLD",
    color: "bg-[#fbbf24]",
    glowColor: "shadow-[0_0_15px_rgba(251,191,36,0.5)]",
    icon: Award,
  },
  silver: {
    label: "SILVER",
    color: "bg-[#9ca3af]",
    glowColor: "shadow-[0_0_10px_rgba(156,163,175,0.4)]",
    icon: Star,
  },
  newbie: {
    label: "NEWBIE",
    color: "bg-[#10b981]",
    glowColor: "shadow-[0_0_10px_rgba(16,185,129,0.3)]",
    icon: Sprout,
  },
}
