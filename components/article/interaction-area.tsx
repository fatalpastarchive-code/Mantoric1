"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Star, MessageSquare, User as UserIcon, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { QuizArea } from "./quiz-area"

interface InteractionAreaProps {
  articleId: string
  initialAverageRating: number
  initialRatingsCount: number
  xpValue?: number
}

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    name: string
    avatar: string | null
    username: string
  }
}

export function InteractionArea({ 
  articleId, 
  initialAverageRating, 
  initialRatingsCount,
  xpValue = 10
}: InteractionAreaProps) {
  const [readingProgress, setReadingProgress] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const { user, isSignedIn } = useUser()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [avgRating, setAvgRating] = useState(initialAverageRating)
  const [ratingsCount, setRatingsCount] = useState(initialRatingsCount)
  const [comment, setComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([])
  const [isSubmittingRating, setIsSubmittingRating] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isLoadingComments, setIsLoadingComments] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      const element = document.documentElement
      const scrollTop = element.scrollTop
      const scrollHeight = element.scrollHeight
      const clientHeight = element.clientHeight
      const windowHeight = scrollHeight - clientHeight
      if (windowHeight > 0) {
        const progress = (scrollTop / windowHeight) * 100
        setReadingProgress(progress)
        
        if (progress > 90 && !quizCompleted) {
          setShowQuiz(true)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [quizCompleted])

  useEffect(() => {
    fetchComments()
  }, [articleId])

  const fetchComments = async () => {
    try {
      const url = `/api/articles/${articleId}/comments`
      console.log("[DEBUG] Fetching comments from:", url)
      
      const res = await fetch(url)
      console.log("[DEBUG] Response status:", res.status, res.statusText)
      
      const contentType = res.headers.get("content-type")
      console.log("[DEBUG] Content-Type:", contentType)
      
      // Check if response is JSON
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text()
        console.error("[DEBUG] Non-JSON response:", text.substring(0, 500))
        throw new Error(`Expected JSON but got ${contentType}`)
      }
      
      const data = await res.json()
      console.log("[DEBUG] Comments data:", data)
      
      if (res.ok) {
        setComments(data.comments || [])
      } else {
        console.error("[DEBUG] API error:", data.error)
      }
    } catch (error) {
      console.error("[DEBUG] Failed to fetch comments:", error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handleRate = async (value: number) => {
    if (!isSignedIn) {
      toast.error("Please sign in to rate.")
      return
    }

    setIsSubmittingRating(true)
    try {
      const res = await fetch(`/api/articles/${articleId}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      })

      const data = await res.json()

      if (res.ok) {
        setRating(value)
        setAvgRating(data.averageRating)
        setRatingsCount(data.ratingsCount)
        toast.success("Article rated! +2 XP awarded.")
      } else {
        toast.error(data.error || "Failed to rate.")
      }
    } catch (error) {
      toast.error("An error occurred.")
    } finally {
      setIsSubmittingRating(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSignedIn) {
      toast.error("Please sign in to comment.")
      return
    }
    if (!comment.trim()) return

    setIsSubmittingComment(true)
    try {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      })

      if (res.ok) {
        setComment("")
        fetchComments()
        toast.success("Comment posted! +5 XP awarded.")
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to post comment.")
      }
    } catch (error) {
      toast.error("An error occurred.")
    } finally {
      setIsSubmittingComment(false)
    }
  }

  return (
    <div className="mt-16 space-y-12 border-t border-border/40 pt-12 pb-20 relative">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-zinc-900">
        <div 
          className="h-full bg-gradient-to-r from-primary via-purple-500 to-emerald-500 transition-all duration-150 ease-out"
          style={{ width: `${readingProgress}%` }}
        />
        <div 
          className="absolute top-0 h-full w-3 bg-white/50 blur-sm transition-all duration-150 ease-out"
          style={{ left: `${readingProgress}%`, transform: "translateX(-100%)" }}
        />
      </div>

      {/* Quiz Area (Anti-Farm) */}
      {showQuiz && !quizCompleted && (
        <QuizArea 
          articleId={articleId}
          xpReward={xpValue}
          onComplete={() => setQuizCompleted(true)}
        />
      )}

      {/* Rating & Commentary (Only show after quiz or if already completed) */}
      <div className={cn("space-y-12 transition-all duration-500", (!quizCompleted && !showQuiz) ? "opacity-20 blur-sm pointer-events-none" : "opacity-100 blur-0")}>
        {/* Rating Section */}
        <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-border/50 bg-secondary/30 p-8 backdrop-blur-sm">
          <div className="text-center">
            <h3 className="text-xl font-extrabold tracking-tight text-foreground">Treatise Quality</h3>
            <div className="mt-1 flex items-center justify-center gap-2">
               <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`h-4 w-4 fill-yellow-500 text-yellow-500 ${avgRating >= star ? "opacity-100" : "opacity-20"}`}
                    />
                  ))}
               </div>
               <span className="text-sm font-bold text-foreground">{avgRating.toFixed(1)}</span>
               <span className="text-xs text-muted-foreground">({ratingsCount} scholars rated)</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rate this Knowledge</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  disabled={isSubmittingRating || rating > 0}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => handleRate(star)}
                  className="group relative transition-all active:scale-90 disabled:cursor-not-allowed"
                >
                  <Star
                    className={`h-10 w-10 transition-all duration-300 ${
                      (hoveredRating || rating) >= star
                        ? "fill-yellow-500 text-yellow-500 scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]"
                        : "text-muted-foreground/30 hover:text-muted-foreground/60"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && <p className="text-xs font-medium text-emerald-400">Rating cast successfully.</p>}
          </div>
        </div>

        {/* Commentary Section (X-style) */}
        <div className="space-y-6">
          <h3 className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            Commentary
          </h3>

          <div className="flex gap-4">
             {isSignedIn ? (
               <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/50 bg-accent">
                  {user.imageUrl ? <img src={user.imageUrl} alt="You" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sm font-bold">U</div>}
               </div>
             ) : (
               <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-800" />
             )}
             
             <form onSubmit={handleSubmitComment} className="flex-1 space-y-3">
               <div className="relative">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your wisdom (Commentary +5 XP)"
                    className="w-full resize-none border-b border-border/60 bg-transparent py-2 text-base leading-relaxed outline-none transition-all placeholder:text-muted-foreground/50 focus:border-purple-500"
                    rows={2}
                  />
               </div>
               <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmittingComment || !comment.trim() || !isSignedIn}
                    className="rounded-full bg-purple-600 px-6 font-bold text-white hover:bg-purple-700 disabled:opacity-50"
                  >
                    {isSubmittingComment ? "Submitting..." : "Post Reply"}
                  </Button>
               </div>
             </form>
          </div>

          <div className="space-y-6 mt-10">
             {isLoadingComments ? (
               <div className="space-y-4">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 w-full animate-pulse rounded-xl bg-zinc-900/50" />)}
               </div>
             ) : comments.length === 0 ? (
               <div className="py-10 text-center text-muted-foreground">
                  <p className="text-sm font-medium">No commentary yet. Be the first to enlighten the forum.</p>
               </div>
             ) : (
               comments.map(c => (
                 <div key={c.id} className="flex gap-4 transition-all animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border/50 bg-secondary">
                       {c.author.avatar ? <img src={c.author.avatar} alt={c.author.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-sm font-bold">{c.author.name.charAt(0)}</div>}
                    </div>
                    <div className="flex-1 space-y-1">
                       <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">
                             {c.author.name}
                          </span>
                          <span className="text-xs text-muted-foreground">@{c.author.username}</span>
                          <span className="text-xs text-zinc-500 font-medium">&bull;</span>
                          <span className="text-xs text-zinc-500 font-medium">
                             {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                          </span>
                       </div>
                       <p className="text-[15px] leading-normal text-foreground/90 whitespace-pre-wrap">
                          {c.content}
                       </p>
                    </div>
                 </div>
               ))
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
