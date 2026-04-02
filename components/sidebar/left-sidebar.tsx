"use client"

import Image from "next/image"
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
  Gem,
  Shield,
  Seedling,
  VenetianMask,
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
  color?: string
}

const navItems: NavItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Articles", href: "/articles", icon: BookOpen },
  { label: "Forum", href: "/forum", icon: MessageSquare },
  { label: "Culture", href: "/culture", icon: Sparkles },
  { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
]

const categoryIcons: Record<string, { icon: React.ElementType }> = {
  "self-improvement": { icon: Sparkles },
  "fitness-health": { icon: Dumbbell },
  "finance-career": { icon: Wallet },
  "relationships": { icon: Heart },
  "philosophy": { icon: Brain },
  "technology": { icon: Cpu },
  "psychology": { icon: VenetianMask },
  "lifestyle": { icon: Coffee },
}

interface LeftSidebarProps {
  activeCategory?: string
}

export function LeftSidebar({ activeCategory }: LeftSidebarProps) {
  const { user, isSignedIn } = useUser()

  return (
    <nav className="flex flex-col h-full w-full bg-black py-0 pr-6 overflow-hidden">
      {/* Scrollable Top Content */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar">
        {/* Main Navigation */}
        <div className="flex flex-col gap-1 w-full">
          {navItems.map((item) => {
            const isActive = (!activeCategory && item.href === "/") || 
                           (activeCategory === item.label.toLowerCase()) ||
                           (item.href !== "/" && activeCategory === item.href.slice(1))
            
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 rounded-3xl px-2 py-2 text-[18px] transition-all duration-200 w-full group",
                  isActive
                    ? "text-white font-medium"
                    : "text-white/70 font-medium hover:text-white"
                )}
              >
                <item.icon 
                  className={cn("h-7 w-7 shrink-0", isActive ? "stroke-[2px]" : "stroke-[1.5px] group-hover:stroke-[2px]")} 
                />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-2 w-full">
          <h3 className="px-2 text-[12px] font-bold uppercase tracking-[0.1em] text-zinc-600 mb-1">
            Categories
          </h3>
          <div className="flex flex-col gap-1.5 w-full">
          {CATEGORIES.map((category) => {
            const categoryData = categoryIcons[category.slug] || { icon: Sparkles }
            const Icon = categoryData.icon
            const isActive = activeCategory === category.slug
            return (
              <Link
                key={category.id}
                href={`/?category=${category.slug}`}
                className={cn(
                  "flex items-center gap-4 rounded-3xl px-2 py-1.5 text-[16px] transition-all duration-200 w-full group",
                  isActive
                    ? "text-white font-medium"
                    : "text-white/70 font-medium hover:text-white"
                )}
              >
                  <Icon 
                    className={cn("h-6 w-6 shrink-0", isActive ? "stroke-[2px]" : "stroke-[1.5px] group-hover:stroke-[2px]")} 
                  />
                  <span className="truncate">{category.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Section (Always Visible) */}
      <div className="flex flex-col gap-1 w-full mt-2 pt-2 border-t border-white/5 bg-black">
        <Link
          href="/help"
          className="flex items-center gap-4 rounded-3xl px-2 py-2 text-[16px] font-medium text-white/70 hover:text-white transition-all w-full group"
        >
          <HelpCircle className="h-6 w-6 shrink-0 stroke-[1.5px] group-hover:stroke-[2px]" />
          <span>Help Center</span>
        </Link>
        
        <Link
          href="/"
          className="flex items-center gap-4 rounded-3xl px-2 py-2 text-[16px] font-medium text-white/70 hover:text-white transition-all w-full group"
        >
          <div className="h-6 w-6 flex items-center justify-center shrink-0 overflow-hidden rounded-sm">
            <Image src="/M.jpg" alt="Mantoric" width={24} height={24} className="object-cover" />
          </div>
          <span>About Mantoric</span>
        </Link>
      </div>
    </nav>
  )
}
