"use client"

import Link from "next/link"
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CATEGORIES } from "@/lib/constants"

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
  return (
    <nav className="flex flex-col gap-6">
      {/* Main Navigation */}
      <div className="flex flex-col gap-0.5">
        {navItems.map((item) => {
          const isActive = !activeCategory && item.href === "/"
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-2">
        <h3 className="font-heading px-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70">
          Categories
        </h3>
        <div className="flex flex-col gap-0.5">
          {CATEGORIES.map((category) => {
            const Icon = categoryIcons[category.slug] || Sparkles
            const isActive = activeCategory === category.slug
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4">
        {bottomNavItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
