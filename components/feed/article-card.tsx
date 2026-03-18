"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Heart, Clock, Crown, Trash2, Landmark, MessageSquare, ShieldCheck, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { HoverProfileCard } from "@/components/feed/hover-profile-card"

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
    rank: string
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

function getRankColor(rank: string): string {
  switch (rank.toLowerCase()) {
    case "caesar":
      return "badge-caesar text-white"
    case "senator":
      return "badge-senator text-black"
    case "praetor":
      return "badge-praetor text-white"
    case "gladiator":
      return "badge-gladiator text-white"
    case "newbie":
      return "badge-newbie text-muted-foreground"
    case "diamond":
      return "badge-diamond text-black"
    case "platinum":
      return "badge-platinum text-black"
    case "gold":
      return "badge-gold text-black"
    case "silver":
      return "badge-silver text-black"
    case "bronze":
      return "badge-bronze text-black"
    default:
      return "bg-secondary text-muted-foreground border-border/50"
  }
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
      className="block cursor-pointer hover:bg-zinc-950/50 transition-colors"
    >
      <div className="flex flex-col gap-3 p-4">
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
                  <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-foreground">
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span
                    className={`text-sm font-bold ${authorIsCaesar ? "caesar-name" : "text-foreground"} ${author.isPremium ? "animate-pulse drop-shadow-[0_0_10px_rgba(168,85,247,0.22)]" : ""}`}
                  >
                    {author.name}
                  </span>
                  {author.isVerifiedExpert && (
                    <div className="text-primary">
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
                        <path d="M22.5 12.5c0-1.58-.88-2.95-2.18-3.66.15-.44.23-.91.23-1.4 0-2.25-1.83-4.07-4.07-4.07-.49 0-.96.08-1.41.23-.71-1.3-2.08-2.18-3.66-2.18s-2.95.88-3.66 2.18c-.44-.15-.91-.23-1.4-.23-2.25 0-4.07 1.83-4.07 4.07 0 .49.08.96.23 1.41-1.3.71-2.18 2.08-2.18 3.66s.88 2.95 2.18 3.66c-.15.44-.23.91-.23 1.4 0 2.25 1.83 4.07 4.07 4.07.49 0 .96-.08 1.41-.23.71 1.3 2.08 2.18 3.66 2.18s2.95-.88 3.66-2.18c.44.15.91.23 1.4.23 2.25 0 4.07-1.83 4.07-4.07 0-.49-.08-.96-.23-1.41 1.3-.71 2.18-2.08 2.18-3.66zM10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    </div>
                  )}
                  {hasSpecialRank ? (
                    <Badge className={`mantoric-role-badge h-4 px-1 text-[9px] uppercase font-bold ${getRankColor(author.rank)} border-none shadow-none`}>
                      {author.rank}
                    </Badge>
                  ) : (
                    <span className="text-[11px] font-bold text-purple-300/90 tabular-nums">
                      Level {respectLevel}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">@{author.username || 'user'} · {formattedDate}</span>
              </div>
            </div>
          </HoverProfileCard>
          <Badge variant="outline" className="text-[10px] opacity-50 font-medium border-none">{category}</Badge>
        </div>

        {/* Content Section */}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[19px] font-extrabold leading-tight text-foreground tracking-tight">
            {title}
          </h3>
          <p className="text-[15px] leading-normal text-muted-foreground/90 line-clamp-2">
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
            <button 
              onClick={handleRespect}
              className="flex items-center gap-2 transition-colors group/respect hover:text-red-500"
            >
              <Heart className={`h-[18px] w-[18px] ${isRespected ? "fill-red-500 text-red-500" : ""}`} />
              <span className={`text-xs font-medium ${isRespected ? "text-red-500" : ""}`}>{localLikes}</span>
            </button>
            
            <div className="flex items-center gap-2 hover:text-blue-500 cursor-pointer transition-colors">
              <MessageSquare className="h-[18px] w-[18px]" />
              <span className="text-xs font-medium">{comments}</span>
            </div>

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
