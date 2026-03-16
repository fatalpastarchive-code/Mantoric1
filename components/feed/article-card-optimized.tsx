"use client"

import { memo, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Heart, MessageCircle, Clock, Eye, Share2, Bookmark, MoreHorizontal, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface ArticleCardProps {
  id: string
  slug: string
  title: string
  excerpt: string
  imageUrl?: string
  category: string
  likes: number
  comments: number
  readTime: number
  createdAt: string
  author: {
    id: string
    clerkId?: string
    username?: string
    name: string
    avatar?: string
    rank?: string
    xp?: number
    bio?: string
    isVerifiedExpert?: boolean
    expertField?: string
  }
  views?: number
  averageRating?: number
}

// Memoized ArticleCard for performance
export const ArticleCard = memo(function ArticleCard({
  id,
  slug,
  title,
  excerpt,
  imageUrl,
  category,
  likes,
  comments,
  readTime,
  createdAt,
  author,
  views = 0,
  averageRating = 0
}: ArticleCardProps) {
  // Memoized handlers
  const handleShare = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title,
        url: `/article/${slug}`
      })
    }
  }, [title, slug])

  const handleBookmark = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Bookmark logic
  }, [])

  return (
    <article className="group relative">
      <Link 
        href={`/article/${slug}`}
        className="block p-4 sm:p-5 transition-colors hover:bg-secondary/30"
      >
        <div className="flex gap-3 sm:gap-4">
          {/* Author Avatar - Lazy loaded */}
          <div className="shrink-0">
            <div className="relative h-10 w-10 sm:h-11 sm:w-11 overflow-hidden rounded-full bg-accent ring-1 ring-border/50 group-hover:ring-primary/30 transition-all">
              {author.avatar ? (
                <Image
                  src={author.avatar}
                  alt={author.name}
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="40px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm font-bold">
                  {author.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Author Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-foreground truncate">
                {author.name}
              </span>
              {author.isVerifiedExpert && (
                <Badge className="h-4 px-1.5 text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">
                  <ShieldCheck className="h-3 w-3 mr-0.5" />
                  {author.expertField || "Expert"}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                @{author.username || "user"}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-[15px] sm:text-base font-bold text-foreground leading-snug mb-1 group-hover:text-primary transition-colors">
              {title}
            </h3>

            {/* Excerpt - Truncated */}
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {excerpt}
            </p>

            {/* Article Image - Lazy loaded */}
            {imageUrl && (
              <div className="relative aspect-[16/9] w-full max-w-md mb-3 rounded-xl overflow-hidden border border-border/50 bg-secondary">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  loading="lazy"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            )}

            {/* Category & Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs font-medium bg-secondary/50">
                  {category}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1 text-xs">
                  <Heart className="h-3.5 w-3.5" />
                  <span>{likes}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>{comments}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{views}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{readTime}m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  )
}, (prevProps, nextProps) => {
  // Custom comparison for memo
  return (
    prevProps.id === nextProps.id &&
    prevProps.likes === nextProps.likes &&
    prevProps.comments === nextProps.comments &&
    prevProps.views === nextProps.views &&
    prevProps.title === nextProps.title
  )
})

// Optimized ArticleCard Skeleton for loading states
export const ArticleCardSkeleton = memo(function ArticleCardSkeleton() {
  return (
    <div className="p-4 sm:p-5 animate-pulse">
      <div className="flex gap-3 sm:gap-4">
        <div className="shrink-0">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-secondary" />
        </div>
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 bg-secondary rounded" />
            <div className="h-3 w-16 bg-secondary rounded" />
          </div>
          <div className="h-5 w-3/4 bg-secondary rounded" />
          <div className="h-4 w-full bg-secondary rounded" />
          <div className="h-4 w-2/3 bg-secondary rounded" />
          <div className="flex items-center gap-4">
            <div className="h-3 w-12 bg-secondary rounded" />
            <div className="h-3 w-12 bg-secondary rounded" />
            <div className="h-3 w-12 bg-secondary rounded" />
          </div>
        </div>
      </div>
    </div>
  )
})
