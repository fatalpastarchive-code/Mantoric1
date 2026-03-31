"use client"

import Image from "next/image"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Clock, Crown, ArrowLeft, Sparkles, BookOpen, Trophy, ShieldCheck, ThumbsUp, ThumbsDown, Star, Heart, Shield } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DeleteButton } from "@/components/article/delete-button"
import { ReadingProgress } from "@/components/article/reading-progress"
import { RespectWriterButton } from "@/components/respect/respect-writer-button"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { toast } from "sonner"

interface ArticleContentProps {
  article: {
    _id: string
    slug: string
    title: string
    content: string
    excerpt?: string
    imageUrl?: string
    coverImage?: string
    category: string
    tags?: string[]
    authorId: string
    likes?: number
    dislikes?: number
    readTime: number
    authorName?: string
    averageRating?: number
    ratingsCount?: number
    publishedAt?: Date
    createdAt: Date
    updatedAt: Date
  }
  author: {
    name: string
    avatar: string
    rank: string
    isCaesar: boolean
    isVerifiedExpert: boolean
    expertField: string
    userId?: string
    respectPoints?: number
    xp?: number
    banner?: string
  }
  isOwnArticle: boolean
}

function getRankBadgeStyles(rank: string) {
  const r = rank?.toLowerCase() || ""
  if (r === "founder" || r === "caesar") return "text-[#D4AF37] font-bold gold-glow"
  if (r === "diamond") return "text-[#E5E4E2] font-bold"
  if (r === "silver") return "text-[#C0C0C0] font-bold"
  if (r === "newbie") return "text-[#4ADE80] font-bold"
  return "text-muted-foreground"
}

export function ArticleContent({ article, author, isOwnArticle }: ArticleContentProps) {
  const { user: currentUser, isSignedIn } = useUser()
  const [likes, setLikes] = useState(article.likes || 0)
  const [isLiked, setIsLiked] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const publishDate = article.publishedAt || article.createdAt
  let dateStr = "recently"
  try {
    dateStr = formatDistanceToNow(new Date(publishDate), { addSuffix: true })
  } catch (e) {}

  const handleLike = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to like")
      return
    }
    setIsLoading(true)
    try {
      // Mock logic as we're refactoring UI
      setIsLiked(!isLiked)
      setLikes(prev => isLiked ? prev - 1 : prev + 1)
      toast.success(isLiked ? "Removed like" : "Article liked!")
    } finally {
      setIsLoading(false)
    }
  }

  const displayImage = article.coverImage || article.imageUrl

  return (
    <>
      <ReadingProgress 
        color="bg-gradient-to-r from-primary via-purple-500 to-emerald-500"
        height={2}
      />

      <div className="flex flex-col pb-20 max-w-3xl mx-auto w-full px-4 sm:px-0">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Feed
          </Link>
          {isOwnArticle && <DeleteButton articleId={article._id} />}
        </div>

        {/* Caesar Card Header - Refactored */}
        <div className="mb-12 overflow-hidden rounded-2xl bg-white/5 border border-white/5 shadow-2xl">
          {/* Banner */}
          <div className="relative h-32 w-full bg-gradient-to-r from-zinc-900 to-black overflow-hidden">
            {author.banner ? (
              <img src={author.banner} alt="Author Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-700 via-zinc-900 to-black" />
            )}
          </div>

          <div className="relative px-6 pb-6">
            {/* Profile Picture Overlap */}
            <div className="absolute -top-12 left-6">
              <div className={cn(
                "relative h-24 w-24 overflow-hidden rounded-full border-4 border-black bg-zinc-900 shadow-xl",
                author.isCaesar && "ring-2 ring-purple-500/50"
              )}>
                {author.avatar ? (
                  <Image src={author.avatar} alt={author.name} fill unoptimized className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-white">
                    {author.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Author Info & Stats Row */}
            <div className="pt-14 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h2 className={cn(
                      "text-xl font-bold tracking-tight",
                      author.isCaesar ? "text-purple-500" : "text-white"
                    )}>
                      {author.name}
                    </h2>
                    <span className={cn("text-[10px] uppercase tracking-[0.2em]", getRankBadgeStyles(author.rank))}>
                      {author.rank}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-500 font-light mt-0.5">{dateStr}</span>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 text-sm">
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold">{author.respectPoints || 0}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Respect</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-white font-bold">{Math.floor((author.xp || 0) / 100) + 1}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Level</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content Area */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl text-balance flex-1">
              {article.title}
            </h1>
            
            {/* Title-Level Tactical Actions - Mobile: below title, Desktop: side */}
            <div className="flex items-center gap-3 sm:mt-2 shrink-0">
              {author.userId && !isOwnArticle && (
                <RespectWriterButton 
                  targetUserId={author.userId} 
                  className="!p-2 !rounded-xl !bg-white/5 !border-white/5 hover:!bg-white/10"
                />
              )}
              <button
                onClick={handleLike}
                disabled={isLoading}
                className={cn(
                  "p-2.5 rounded-xl border border-white/5 transition-all duration-300",
                  isLiked 
                    ? "bg-red-500/20 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                    : "bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10"
                )}
              >
                <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
              </button>
              <button
                onClick={handleLike}
                disabled={isLoading}
                className={cn(
                  "p-2.5 rounded-xl border border-white/5 transition-all duration-300 flex items-center gap-2",
                  isLiked 
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
                    : "bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10"
                )}
              >
                <Crown className={cn("h-5 w-5", isLiked && "fill-current")} />
                <span className="text-xs font-medium">{author.respectPoints || 0}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              {article.category}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>{article.readTime} min read</span>
            </div>
          </div>

          <article className="prose-mantoric prose prose-invert prose-lg max-w-none text-zinc-300 leading-relaxed selection:bg-purple-500/30">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </article>

          {/* Tags Footer */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-8 border-t border-white/5">
              {article.tags.map((tag: string) => (
                <span key={tag} className="rounded-xl bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-500 transition-colors hover:text-white hover:bg-white/10">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

