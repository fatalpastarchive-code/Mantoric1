"use client"

import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import {
  Home,
  Flame,
  BookOpen,
  MessageSquare,
  Trophy,
  HelpCircle,
  Sparkles,
  Dumbbell,
  Wallet,
  Heart,
  Brain,
  Cpu,
  Coffee,
  Crown,
  Landmark,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CATEGORIES } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { PrestigeBox } from "./prestige-box"

interface UserStats {
  rank: string
  reputation: number
  badgeLevel: "Newbie" | "Copper" | "Silver" | "Gold" | "Diamond"
  respectPoints: number
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Trending", href: "/trending", icon: Flame },
  { label: "Articles", href: "/articles", icon: BookOpen },
  { label: "Forum", href: "/forum", icon: MessageSquare },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
]

const bottomNavItems: NavItem[] = [
  { label: "Help", href: "/help", icon: HelpCircle },
]

const categoryIcons: Record<string, React.ElementType> = {
  "self-improvement": Sparkles,
  "fitness-health": Dumbbell,
  "finance-career": Wallet,
  "relationships": Heart,
  "philosophy": Brain,
  "technology": Cpu,
  "lifestyle": Coffee,
}

interface LeftSidebarProps {
  activeCategory?: string
}

export function LeftSidebar({ activeCategory }: LeftSidebarProps) {
  const { user, isSignedIn } = useUser()
  const [stats, setStats] = useState<UserStats | null>(null)

  useEffect(() => {
    if (isSignedIn && user?.username) {
      fetch(`/api/user/profile?username=${user.username}`)
        .then(async res => {
          const contentType = res.headers.get("content-type")
          if (!contentType || !contentType.includes("application/json")) {
            const text = await res.text()
            console.error("[DEBUG] Profile API non-JSON:", text.substring(0, 100))
            throw new Error("Non-JSON response")
          }
          return res.json()
        })
        .then(data => {
          if (data.user) {
            setStats({
              rank: data.user.rank || "Newbie",
              reputation: data.user.respectPoints || 0,
              badgeLevel: data.user.badgeLevel || "Newbie",
              respectPoints: data.user.respectPoints || 0
            })
          }
        })
        .catch(err => console.error("Failed to fetch sidebar stats:", err))
    }
  }, [isSignedIn, user?.username])

  const getRankIcon = (rank: string) => {
    switch (rank.toLowerCase()) {
      case "caesar": return <Crown className="h-3 w-3 mr-1" />
      case "senator": return <Landmark className="h-3 w-3 mr-1" />
      default: return null
    }
  }

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
    <nav className="flex flex-col h-full gap-6 w-full overflow-y-auto no-scrollbar">
      {/* Prestige Box - Modern Profile Card removed from here */}

      {/* Main Navigation */}
      <div className="flex flex-col gap-1 w-full">
        {navItems.map((item) => {
          const isActive = !activeCategory && item.href === "/"
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-4 rounded-full px-4 py-3 text-[17px] font-medium transition-all duration-200 w-fit max-w-full",
                isActive
                  ? "text-foreground font-bold"
                  : "text-foreground hover:bg-accent"
              )}
            >
              <item.icon className={cn("h-6 w-6 shrink-0", isActive && "stroke-[3px]")} />
              <span className="truncate">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-1 mt-4 w-full">
        <h3 className="px-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50 mb-2">
          Categories
        </h3>
        <div className="flex flex-col gap-1 w-full">
          {CATEGORIES.map((category) => {
            const Icon = categoryIcons[category.slug] || Sparkles
            const isActive = activeCategory === category.slug
            return (
              <Link
                key={category.id}
                href={`/?category=${category.slug}`}
                className={cn(
                  "flex items-center gap-4 rounded-full px-4 py-2 text-[15px] font-medium transition-all duration-200 w-fit max-w-full",
                  isActive
                    ? "bg-accent text-foreground font-bold"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{category.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
