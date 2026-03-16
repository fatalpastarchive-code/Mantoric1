"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Crown, Landmark, Sparkles, User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface HoverProfileCardProps {
  author: {
    id: string
    name: string
    username: string
    avatar: string | null
    rank: string
    xp: number
    bio?: string
    isVerifiedExpert?: boolean
    expertField?: string
  }
  children: React.ReactNode
}

export function HoverProfileCard({ author, children }: HoverProfileCardProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setIsVisible(true), 400)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setIsVisible(false), 300)
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
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div className="absolute bottom-full left-0 z-[100] mb-2 w-72 animate-in fade-in zoom-in-95 duration-200">
          <div className="overflow-hidden rounded-2xl border border-border/30 bg-card shadow-2xl backdrop-blur-xl">
            {/* Minimal Header/Banner Background */}
            <div className="h-16 w-full bg-gradient-to-br from-zinc-900 to-black" />
            
            <div className="p-4">
              <div className="flex justify-between items-start -mt-10 mb-2">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border-4 border-card bg-accent">
                  {author.avatar ? (
                    <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-bold bg-zinc-800">
                      {author.name.charAt(0)}
                    </div>
                  )}
                </div>
                <button className="rounded-full bg-foreground px-4 py-1.5 text-xs font-bold text-background transition-colors hover:bg-foreground/90 mt-10">
                  Follow
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <span className="font-bold text-foreground text-base leading-tight">
                    {author.name}
                  </span>
                  {author.isVerifiedExpert && (
                    <div className="text-primary" title={`Verified Expert in ${author.expertField}`}>
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                        <path d="M22.5 12.5c0-1.58-.88-2.95-2.18-3.66.15-.44.23-.91.23-1.4 0-2.25-1.83-4.07-4.07-4.07-.49 0-.96.08-1.41.23-.71-1.3-2.08-2.18-3.66-2.18s-2.95.88-3.66 2.18c-.44-.15-.91-.23-1.4-.23-2.25 0-4.07 1.83-4.07 4.07 0 .49.08.96.23 1.41-1.3.71-2.18 2.08-2.18 3.66s.88 2.95 2.18 3.66c-.15.44-.23.91-.23 1.4 0 2.25 1.83 4.07 4.07 4.07.49 0 .96-.08 1.41-.23.71 1.3 2.08 2.18 3.66 2.18s2.95-.88 3.66-2.18c.44.15.91.23 1.4.23 2.25 0 4.07-1.83 4.07-4.07 0-.49-.08-.96-.23-1.41 1.3-.71 2.18-2.08 2.18-3.66zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground leading-none mb-2">@{author.username}</p>
              </div>

              {author.bio && (
                <p className="mt-3 text-sm text-foreground/90 line-clamp-2 leading-normal">
                  {author.bio}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Badge className={cn("h-5 px-2 text-[10px] font-bold border-none", getRankColor(author.rank))}>
                  {author.rank}
                </Badge>
                <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  {author.xp.toLocaleString()} XP
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-border/20 flex gap-4 text-sm">
                <div className="flex gap-1">
                  <span className="font-bold text-foreground">1.2k</span>
                  <span className="text-muted-foreground">Following</span>
                </div>
                <div className="flex gap-1">
                  <span className="font-bold text-foreground">4.5k</span>
                  <span className="text-muted-foreground">Followers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
