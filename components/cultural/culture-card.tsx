"use client"

import { useState } from "react"
import { BookOpen, Film, Star, Trash2, Quote, Heart, ShieldCheck, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { deleteCulturalReview } from "@/lib/actions/cultural-review-actions"
import { giveRespect } from "@/lib/actions/respect-actions"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { HoverProfileCard } from "@/components/feed/hover-profile-card"
import { getRankIcon, getRankBadgeStyles } from "@/components/ui/authority-badge"
import { formatDistanceToNow } from "date-fns"
import type { CulturalReview } from "@/lib/db/schema"

import { useRouter } from "next/navigation"

interface AuthorInfo {
  id: string
  clerkId?: string
  username?: string
  name: string
  avatar?: string | null
  rank: string
  xp: number
  respectPoints?: number
  bio?: string
}

interface CultureCardProps {
  review: CulturalReview & { author?: AuthorInfo }
  isOwnProfile?: boolean
  onDelete?: () => void
  showLikes?: boolean
  initialLikes?: number
  onDiscussInArena?: (review: CulturalReview) => void
}

export function CultureCard({ 
  review, 
  isOwnProfile = false, 
  onDelete, 
  showLikes = true, 
  initialLikes = 0,
  onDiscussInArena 
}: CultureCardProps) {
  const { user } = useUser()
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [respectCount, setRespectCount] = useState(0)
  const [hasRespected, setHasRespected] = useState(false)
  const [showRespectTooltip, setShowRespectTooltip] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikes)
  const [hasLiked, setHasLiked] = useState(false)
  const [showDiscussTooltip, setShowDiscussTooltip] = useState(false)

  const author = review.author
  const formattedDate = review.createdAt ? formatDistanceToNow(new Date(review.createdAt), { addSuffix: true }) : "recently"

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteCulturalReview(review._id)
      if (result.success) {
        toast.success("Removed from archive")
        onDelete?.()
      } else {
        toast.error(result.error || "Failed to delete")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRespect = async () => {
    if (hasRespected) return
    
    try {
      const result = await giveRespect(review.userId)
      if (result.success) {
        setRespectCount(prev => prev + 1)
        setHasRespected(true)
        toast.success("Respect given")
      }
    } catch (error) {
      toast.error("Failed to give respect")
    }
  }

  const handleLike = async () => {
    if (hasLiked) return
    
    try {
      setLikeCount(prev => prev + 1)
      setHasLiked(true)
      toast.success("Liked")
    } catch (error) {
      setLikeCount(initialLikes)
      setHasLiked(false)
      toast.error("Failed to like")
    }
  }

  const handleDiscuss = () => {
    if (onDiscussInArena) {
      onDiscussInArena(review)
    } else {
      router.push(`/forum/publish?title=${encodeURIComponent(`[Discussion] ${review.title}`)}&sourceId=${review._id}&type=culture`)
    }
  }

  const canDelete = isOwnProfile || user?.id === CAESAR_CLERK_ID
  const TypeIcon = review.type === "BOOK" ? BookOpen : Film
  const TypeLabel = review.type === "BOOK" ? "Book" : review.type === "MOVIE" ? "Film" : "Series"

  return (
    <div className="relative rounded-2xl bg-black border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300">
      {/* Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
      
      {/* Content Grid - Mobile: flex-col, Desktop: flex-row */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
        {/* Poster Image - Mobile: full width, Desktop: fixed size */}
        <div className="relative shrink-0 mx-auto sm:mx-0">
          <div className="relative h-56 w-full sm:h-44 sm:w-28 rounded-xl overflow-hidden border border-zinc-800 shadow-xl">
            <img
              src={review.imageUrl}
              alt={review.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>
          
          {/* Type Badge */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-zinc-900 border border-zinc-700 rounded-full flex items-center gap-1.5 shadow-lg">
            <TypeIcon className="h-3 w-3 text-zinc-400" />
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">{TypeLabel}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Author Header - With Hover Profile Card */}
          <div className="flex items-center justify-between">
            {author ? (
              <HoverProfileCard author={{
                id: author.id,
                clerkId: author.clerkId,
                username: author.username || 'user',
                name: author.name,
                avatar: author.avatar || null,
                rank: author.rank,
                xp: author.xp,
                respectPoints: author.respectPoints,
                bio: author.bio
              }}>
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="relative h-8 w-8 overflow-hidden rounded-full bg-zinc-900 ring-2 ring-zinc-800">
                    {author.avatar ? (
                      <img src={author.avatar} alt={author.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-medium text-zinc-400">
                        {author.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white hover:text-purple-400 transition-colors">
                        {author.name}
                      </span>
                      <div className="flex items-center">
                        {getRankIcon(author.rank)}
                        <span className={cn("text-[9px] uppercase tracking-widest", getRankBadgeStyles(author.rank))}>
                          {author.rank}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500">@{author.username || 'user'} · {formattedDate}</span>
                  </div>
                </div>
              </HoverProfileCard>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-zinc-800" />
                <span className="text-sm text-zinc-500">Unknown</span>
              </div>
            )}

          {/* Action Buttons Row - Mobile: wrap, Desktop: row */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
              {/* Discuss in Arena Button */}
              <button
                onClick={handleDiscuss}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                  "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400 border border-zinc-700/50"
                )}
              >
                <Zap className="h-3 w-3" />
                <span>Arena</span>
              </button>

              {/* Respect Button */}
              <div className="relative">
                <button
                  onClick={handleRespect}
                  disabled={hasRespected}
                  onMouseEnter={() => setShowRespectTooltip(true)}
                  onMouseLeave={() => setShowRespectTooltip(false)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200",
                    hasRespected 
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
                      : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-purple-400 border border-zinc-800"
                  )}
                >
                  <ShieldCheck className={cn("h-3.5 w-3.5", hasRespected && "fill-purple-500/30")} />
                  <span className="text-xs font-medium">{respectCount + (hasRespected ? 1 : 0)}</span>
                </button>
                
                {showRespectTooltip && (
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-300 whitespace-nowrap z-10 shadow-xl">
                    {hasRespected ? "Respected" : "Give Respect"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title & Rating */}
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white leading-tight">
              {review.title}
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(10)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      "h-3 w-3",
                      i < review.rating 
                        ? "fill-purple-500 text-purple-500" 
                        : "fill-zinc-800 text-zinc-800"
                    )} 
                  />
                ))}
              </div>
              <span className="text-xs text-purple-400 font-medium">{review.rating}/10</span>
            </div>
          </div>

          {/* Quote */}
          {review.quote && (
            <div className="relative pl-4 border-l border-purple-500/50 py-1">
              <p className="text-sm italic text-zinc-300 leading-relaxed tracking-wide" style={{ fontFamily: 'var(--font-cormorant), serif' }}>
                &ldquo;{review.quote}&rdquo;
              </p>
            </div>
          )}

          {/* Review */}
          <p className={cn(
            "text-sm text-zinc-400 leading-relaxed",
            !isExpanded && "line-clamp-3"
          )}>
            {review.review}
          </p>

          {/* Stats Row - Mobile: justify-between */}
          <div className="flex items-center justify-between sm:justify-start gap-4 pt-2 border-t border-zinc-800/50">
            <div className="flex items-center gap-4">
              {/* Respect Button (Unified) */}
              {showLikes && (
                <button
                  onClick={handleLike}
                  disabled={hasLiked}
                  className={cn(
                    "flex items-center gap-1.5 text-xs transition-colors",
                    hasLiked ? "text-purple-400" : "text-zinc-500 hover:text-purple-400"
                  )}
                >
                  <ShieldCheck className={cn("h-4 w-4", hasLiked && "fill-purple-500/20")} />
                  <span className="font-medium">{likeCount + (hasLiked ? 1 : 0)}</span>
                </button>
              )}
              
              {review.review.length > 150 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-zinc-500 hover:text-purple-400 transition-colors font-medium"
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
            
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-7 px-2 text-xs text-zinc-500 hover:text-red-400 hover:bg-red-950/20"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {isDeleting ? "..." : "Remove"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
