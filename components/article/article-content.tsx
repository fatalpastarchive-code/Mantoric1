"use client"

import Image from "next/image"
import ReactMarkdown from "react-markdown"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Clock, Crown, ArrowLeft, Sparkles, BookOpen, Trophy, ShieldCheck, ThumbsUp, ThumbsDown, Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { DeleteButton } from "@/components/article/delete-button"
import { ArticleFeedback } from "./article-feedback"
import { ReadingProgress } from "@/components/article/reading-progress"
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
  }
  isOwnArticle: boolean
}

function getRankColor(rank: string): string {
  switch (rank.toLowerCase()) {
    case "caesar": return "badge-caesar text-background"
    case "diamond": return "badge-diamond text-background"
    case "platinum": return "badge-platinum text-background"
    case "gold": return "badge-gold text-background"
    case "silver": return "badge-silver text-background"
    case "bronze": return "badge-bronze text-background"
    case "praetor": return "badge-praetor text-background"
    case "newbie": default: return "bg-secondary text-muted-foreground border-border/50"
  }
}

export function ArticleContent({ article, author, isOwnArticle }: ArticleContentProps) {
  const { user: currentUser, isSignedIn } = useUser()
  const [reputation, setReputation] = useState(0)
  const [hasVoted, setHasVoted] = useState(false)
  const [userVote, setUserVote] = useState(0)
  const [totalVoters, setTotalVoters] = useState(0)
  const [isLoadingRep, setIsLoadingRep] = useState(true)

  // Fetch reputation on mount
  useEffect(() => {
    if (author.userId) {
      fetchReputation()
    }
  }, [author.userId])

  const fetchReputation = async () => {
    try {
      const url = `/api/user/${author.userId}/reputation`
      console.log("[DEBUG] Fetching reputation:", url)
      
      const res = await fetch(url)
      console.log("[DEBUG] Reputation status:", res.status)
      
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("[DEBUG] Reputation non-JSON response:", text.substring(0, 200))
        return
      }
      
      if (res.ok) {
        const data = await res.json()
        setReputation(data.reputation)
        setHasVoted(data.hasGivenReputation)
        setUserVote(data.givenAmount)
        setTotalVoters(data.totalGivers)
      }
    } catch (error) {
      console.error("[DEBUG] Failed to fetch reputation:", error)
    } finally {
      setIsLoadingRep(false)
    }
  }

  const handleVote = async (amount: number) => {
    if (!isSignedIn) {
      toast.error("Please sign in to vote")
      return
    }
    if (isOwnArticle) {
      toast.error("Cannot vote on your own content")
      return
    }
    if (hasVoted) {
      toast.error("You have already voted for this author")
      return
    }

    try {
      const res = await fetch(`/api/user/${author.userId}/reputation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })

      if (res.ok) {
        setHasVoted(true)
        setUserVote(amount)
        setReputation(prev => prev + amount)
        setTotalVoters(prev => prev + 1)
        toast.success(amount > 0 ? "Reputation increased!" : "Reputation decreased")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to vote")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const publishDate = article.publishedAt || article.createdAt
  let dateStr = "recently"
  try {
    dateStr = formatDistanceToNow(new Date(publishDate), { addSuffix: true })
  } catch (e) {}

  const displayImage = article.coverImage || article.imageUrl

  return (
    <>
      {/* Reading Progress Bar - Fixed at top */}
      <ReadingProgress 
        color="bg-gradient-to-r from-primary via-purple-500 to-emerald-500"
        height={2}
      />

      <div className="flex flex-col pb-20 max-w-2xl mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Feed
          </Link>
          
          {isOwnArticle && <DeleteButton articleId={article._id} />}
        </div>

        {/* Article Header */}
        <header className="space-y-6 mb-10">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              {article.category}
            </Badge>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <Clock className="h-3.5 w-3.5" />
              <span>{article.readTime} min read</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              <span>+{article.readTime * 5} Respect</span>
            </div>
          </div>

          <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
            {article.title}
          </h1>

          {/* Author Block */}
          <div className="flex items-center gap-4 pt-4 border-t border-border/40">
            <div className={cn(
              "relative h-12 w-12 overflow-hidden rounded-full bg-accent ring-2",
              author.isCaesar ? "caesar-ring ring-[#9333ea]" : "ring-border"
            )}>
              {author.avatar ? (
                <Image src={author.avatar} alt={author.name} fill unoptimized className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-foreground">
                  {author.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-base font-bold",
                  author.isCaesar ? "caesar-name" : "text-foreground"
                )}>
                  {author.name}
                </span>
                {author.isVerifiedExpert && (
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold">
                    <ShieldCheck className="h-3 w-3 mr-0.5" />
                    {author.expertField || "Verified Expert"}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                {author.isCaesar ? (
                  <Badge className="mantoric-role-badge badge-caesar border-0 font-bold tracking-wide text-background">
                    <Crown className="mr-0.5 h-2 w-2" />
                    Caesar
                  </Badge>
                ) : (
                  <Badge className={cn(
                    "mantoric-role-badge font-bold uppercase tracking-wide border-0",
                    getRankColor(author.rank)
                  )}>
                    {author.rank}
                  </Badge>
                )}
                <span>&bull;</span>
                <span className="font-medium text-foreground/80">{dateStr}</span>
              </div>
            </div>

            {/* Reputation Voting */}
            {author.userId && !isOwnArticle && (
              <div className="ml-auto flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">Reputation</span>
                  <span className="text-sm font-bold text-purple-400">{reputation.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleVote(1)}
                    disabled={hasVoted || !isSignedIn}
                    className={cn(
                      "p-1 rounded transition-colors",
                      hasVoted && userVote === 1
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "hover:bg-secondary text-muted-foreground hover:text-emerald-400",
                      (!isSignedIn || hasVoted) && "opacity-50 cursor-not-allowed"
                    )}
                    title={!isSignedIn ? "Sign in to vote" : hasVoted ? "Already voted" : "Increase reputation"}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleVote(-1)}
                    disabled={hasVoted || !isSignedIn}
                    className={cn(
                      "p-1 rounded transition-colors",
                      hasVoted && userVote === -1
                        ? "bg-red-500/20 text-red-400"
                        : "hover:bg-secondary text-muted-foreground hover:text-red-400",
                      (!isSignedIn || hasVoted) && "opacity-50 cursor-not-allowed"
                    )}
                    title={!isSignedIn ? "Sign in to vote" : hasVoted ? "Already voted" : "Decrease reputation"}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            {isOwnArticle && author.userId && (
              <div className="ml-auto flex flex-col items-end">
                <span className="text-xs text-muted-foreground">Your Reputation</span>
                <span className="text-sm font-bold text-purple-400">{reputation.toLocaleString()}</span>
              </div>
            )}
          </div>
        </header>

        {/* Featured Cover Image */}
        <div className="relative aspect-[21/9] w-full mb-12 overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/5 bg-gradient-to-br from-secondary via-accent to-secondary/50">
          {displayImage ? (
            <img 
              src={displayImage} 
              alt={article.title}
              className="object-cover w-full h-full" 
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none">
              <span className="font-heading text-6xl font-black tracking-[0.2em] text-[#9333ea]/20 uppercase">Mantoric</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
        </div>

        {/* Clean Markdown Article Content */}
        <article className="prose-mantoric prose prose-invert prose-lg max-w-none text-foreground/90 selection:bg-emerald-500/30">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </article>

        {/* Tags Footer */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-10 mt-10">
            {article.tags.map((tag: string) => (
              <span key={tag} className="rounded-full bg-secondary/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary/70">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Article Feedback - Like/Dislike Only */}
        <ArticleFeedback
          articleId={article.slug}
          initialLikes={article.likes || 0}
          initialDislikes={article.dislikes || 0}
        />
      </div>
    </>
  )
}
