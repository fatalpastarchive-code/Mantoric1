"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, Clock, Crown, Trash2, Landmark, MessageSquare, ShieldCheck, Sparkles, Gem, Shield, Sprout, Zap } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { HoverProfileCard } from "@/components/feed/hover-profile-card"
import { AuthorityBadge } from "@/components/ui/authority-badge"
import { RankBadge } from "@/components/ui/rank-badge"
import type { UserRole } from "@/lib/db/schema"

export interface ArticleCardProps {
  id: string
  slug: string
  title: string
  excerpt: string
  imageUrl: string
  author: {
    id: string
    clerkId?: string
    username?: string
    name: string
    avatar?: string | null
    rank: UserRole | string
    xp: number
    respectPoints?: number
    isPremium?: boolean
    subscriptionTier?: "free" | "black" | "founder"
    bio?: string
    isVerifiedExpert?: boolean
    expertField?: string
  }
  category: string
  likes: number
  comments: number
  readTime: number
  createdAt: Date | string
}

function isCaesar(clerkId?: string): boolean {
  return !!clerkId && clerkId === CAESAR_CLERK_ID
}

export function ArticleCard({
  id,
  slug,
  title,
  excerpt,
  imageUrl,
  author,
  likes,
  comments,
  readTime,
  createdAt,
  category,
}: ArticleCardProps) {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  
  const [localLikes, setLocalLikes] = useState(likes)
  const [isRespected, setIsRespected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const authorIsCaesar = isCaesar(author.clerkId)
  const hasSpecialRank = !!author.rank && author.rank.toLowerCase() !== "newbie"
  const respectLevel = Math.max(1, Math.floor((author.respectPoints || 0) / 100) + 1)
  
  // Format the date
  let formattedDate = ""
  try {
    formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true })
  } catch (e) {
    formattedDate = "recently"
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user || user.id !== CAESAR_CLERK_ID) return

    toast("Are you sure you want to securely delete this article?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const res = await fetch(`/api/articles/${id}`, { method: "DELETE" })
            if (res.ok) {
              toast.success("Article deleted.")
              router.refresh()
            } else {
              toast.error("Failed to delete article.")
            }
          } catch (error) {
            toast.error("An error occurred.")
          }
        }
      },
    })
  }

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!author.username) return
    router.push(`/profile/${author.username}`)
  }

  const handleRespect = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isSignedIn) {
      alert("Please sign in to interact.")
      return
    }

    setIsLoading(true)
    try {
      // Optimistic update for UI feel
      setIsRespected(!isRespected)
      setLocalLikes((prev) => isRespected ? prev - 1 : prev + 1)
      
      const res = await fetch("/api/respect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: id,
          targetType: "article"
        })
      })
      const data = await res.json()
      if (res.ok) {
        setIsRespected(data.respected)
        setLocalLikes(data.newCount)
      } else {
        // Revert on failure
        setIsRespected(isRespected)
        setLocalLikes(likes)
      }
    } catch (error) {
      console.error("Failed to respect", error)
      setIsRespected(isRespected)
      setLocalLikes(likes)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCardClick = () => {
    router.push(`/article/${slug}`)
  }

  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      router.push(`/article/${slug}`)
    }
  }

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className="block cursor-pointer hover:bg-accent/40 transition-all duration-300 rounded-3xl border border-transparent hover:border-border/30 shadow-sm hover:shadow-md"
    >
      <div className="flex flex-col gap-5 p-8 md:p-10">
        {/* Author Header */}
        <div className="flex items-center justify-between">
          <HoverProfileCard author={{
            id: author.id,
            name: author.name,
            username: author.username || 'user',
            avatar: author.avatar || null,
            rank: author.rank,
            respectPoints: author.respectPoints,
            xp: author.xp,
            isVerifiedExpert: author.isVerifiedExpert,
            expertField: author.expertField,
            bio: author.bio
          }}>
            <div className="flex items-center gap-2 cursor-pointer" onClick={handleAuthorClick}>
              <div className={`relative h-10 w-10 overflow-hidden rounded-full bg-accent`}>
                {author.avatar ? (
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-medium text-foreground">
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className={cn(
                  "absolute -bottom-1 -right-1 z-10",
                  (author.rank === "CAESAR" || author.rank === "SENATOR" || author.rank === "LEGATE") && "shadow-[0_0_15px_rgba(168,85,247,0.4)] rounded-full animate-pulse"
                )}>
                  <RankBadge role={author.rank as any || "CITIZEN"} size="sm" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-sm font-semibold ${authorIsCaesar ? "caesar-name" : "text-foreground"} ${author.isPremium ? "animate-pulse drop-shadow-[0_0_10px_rgba(168,85,247,0.22)]" : ""}`}
                  >
                    {author.name}
                  </span>
                  {author.isVerifiedExpert && (
                    <div className="text-blue-400">
                      <ShieldCheck className="h-3.5 w-3.5 fill-current" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground font-light">@{author.username || 'user'} · {formattedDate}</span>
              </div>
            </div>
          </HoverProfileCard>
          <Badge variant="outline" className="text-[10px] opacity-70 font-medium border-border/30 bg-muted/30">{category}</Badge>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-3">
          <h3 className="text-2xl md:text-3xl font-bold leading-tight text-foreground tracking-tight serif-font">
            {title}
          </h3>
          <p className="text-[17px] md:text-lg leading-relaxed text-muted-foreground/90 line-clamp-3 font-light tracking-wide italic-excerpt">
            {excerpt}
          </p>
        </div>

        {/* Full-width Image */}
        {imageUrl && (
          <div className="relative aspect-[1.91/1] w-full overflow-hidden rounded-2xl">
            <Image
              src={imageUrl}
              alt={title}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center justify-between mt-1 text-muted-foreground/60">
          <div className="flex items-center gap-8">
            {/* Respect (Like) - Unified Symbol */}
            <div 
              onClick={handleRespect}
              className={cn(
                "flex items-center gap-2 cursor-pointer transition-colors group",
                isRespected ? "text-purple-400" : "hover:text-purple-400"
              )}
            >
              <ShieldCheck className={cn("h-[18px] w-[18px]", isRespected && "fill-purple-500/20")} />
              <span className="text-xs font-medium group-hover:text-purple-400 transition-colors">{localLikes}</span>
            </div>
            
            <div className="flex items-center gap-2 hover:text-blue-500 cursor-pointer transition-colors group">
              <MessageSquare className="h-[18px] w-[18px]" />
              <span className="text-xs font-medium group-hover:text-blue-500 transition-colors">{comments}</span>
            </div>

            {/* Discuss in Arena - Neural Interlinking (Zap Icon) */}
            <Link 
              href={`/forum/publish?title=${encodeURIComponent(`[Discussion] ${title}`)}&sourceId=${slug}&type=article`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 hover:text-amber-400 cursor-pointer transition-colors group"
            >
              <Zap className="h-[18px] w-[18px]" />
              <span className="text-xs font-medium group-hover:text-amber-400 transition-colors">Arena</span>
            </Link>

            <div className="flex items-center gap-2">
              <Clock className="h-[18px] w-[18px]" />
              <span className="text-xs font-medium">{readTime} min</span>
            </div>
          </div>

          {user?.id === CAESAR_CLERK_ID && (
            <button onClick={handleDelete} className="hover:text-red-500 transition-colors p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
