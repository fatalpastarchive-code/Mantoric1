"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, Clock, Crown, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { formatDistanceToNow } from "date-fns"
import { motion } from "framer-motion"
import { toast } from "sonner"

export interface ArticleCardProps {
  id: string
  slug: string
  title: string
  excerpt: string
  imageUrl: string
  author: {
    clerkId?: string
    username?: string
    name: string
    avatar?: string
    bannerUrl?: string
    bio?: string
    rank: string
    xp: number
  }
  likes: number
  comments: number
  readTime: number
  createdAt: string
  category: string
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

  return (
    <Link href={`/article/${slug}`} className="block">
      <Card className="group overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card">
        {/* Image Container */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-secondary via-accent to-secondary/50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <span className="font-heading text-4xl font-bold tracking-widest text-[#9333ea]/20 uppercase">Mantoric</span>
            </div>
          )}
          {/* Subtle gradient overlay to ensure text logic is clean */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute left-4 top-4">
            <Badge variant="secondary" className="border-0 bg-background/90 px-3 py-1 text-xs font-medium text-foreground backdrop-blur-md">
              {category}
            </Badge>
          </div>
        </div>

        <CardContent className="p-5">

          {/* Title */}
          <h3 className="font-heading mb-3 line-clamp-2 text-xl font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-foreground/80">
            {title}
          </h3>

          {/* Excerpt */}
          <p className="mb-5 line-clamp-2 text-sm leading-relaxed text-muted-foreground prose-mantoric">
            {excerpt}
          </p>

          {/* Author & Stats Row */}
          <div className="flex items-center justify-between border-t border-border/50 pt-4">
            {/* Author Info (clickable → profile) */}
            <div
              className="group/author relative flex items-center gap-3 cursor-pointer"
              onClick={handleAuthorClick}
            >
              <div className={`relative h-10 w-10 overflow-hidden rounded-full bg-accent ring-2 ${authorIsCaesar ? "ring-[#9333ea]" : "ring-border/50"}`}>
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
              <div className="flex flex-col gap-0.5">
                <span className={`text-sm font-semibold ${authorIsCaesar ? "caesar-name" : "text-foreground"}`}>
                  {author.name}
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`mantoric-role-badge font-bold uppercase tracking-wide border-0 ${getRankColor(author.rank)}`}
                  >
                    {authorIsCaesar && <Crown className="mr-1 h-3 w-3" />}
                    {authorIsCaesar ? "Caesar" : author.rank}
                  </Badge>
                  <span suppressHydrationWarning className="text-[11px] tabular-nums text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formattedDate}
                  </span>
                </div>
              </div>
              
              {/* Hover Box Info */}
              <div className="pointer-events-none absolute bottom-12 left-0 hidden w-72 z-20 rounded-xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl group-hover/author:block">
                <div className="relative h-20 w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
                  {author.bannerUrl && (
                    <Image
                      src={author.bannerUrl}
                      alt={`${author.name} banner`}
                      fill
                      unoptimized
                      className="object-cover opacity-90"
                    />
                  )}
                </div>
                <div className="flex items-center gap-3 px-3 pb-3 pt-2">
                  <div className={`relative -mt-8 h-12 w-12 overflow-hidden rounded-full border-2 border-background bg-accent ${authorIsCaesar ? "ring-2 ring-[#9333ea]" : ""}`}>
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
                    <span className={`text-sm font-semibold ${authorIsCaesar ? "caesar-name" : "text-foreground"}`}>
                      {author.name}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge className={`mantoric-role-badge h-4 px-1.5 text-[9px] ${getRankColor(author.rank)}`}>
                        {authorIsCaesar ? <Crown className="mr-1 h-2.5 w-2.5" /> : author.rank.toLowerCase() === "senator" ? <Landmark className="mr-1 h-2.5 w-2.5" /> : null}
                        {author.rank}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {author.xp.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-muted-foreground z-10 relative">
              {user?.id === CAESAR_CLERK_ID && (
                <button
                  onClick={handleDelete}
                  className="flex items-center justify-center p-1.5 transition-colors text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md"
                  title="Secure Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
              
              <button 
                onClick={handleRespect}
                disabled={isLoading}
                className="flex items-center gap-1.5 transition-colors group/respect focus:outline-none"
              >
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  animate={isRespected ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Heart 
                    className={`h-5 w-5 transition-colors duration-300 ${isRespected ? "fill-red-500 text-red-500" : "group-hover/respect:text-red-400"}`} 
                  />
                </motion.div>
                <span className={`text-sm tabular-nums font-medium ${isRespected ? "text-red-500" : ""}`}>{localLikes}</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
