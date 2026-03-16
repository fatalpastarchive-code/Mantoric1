"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ArticleFeedbackProps {
  articleId: string
  initialLikes?: number
  initialDislikes?: number
  userVote?: "like" | "dislike" | null
}

export function ArticleFeedback({ 
  articleId, 
  initialLikes = 0, 
  initialDislikes = 0,
  userVote = null 
}: ArticleFeedbackProps) {
  const [likes, setLikes] = useState(initialLikes)
  const [dislikes, setDislikes] = useState(initialDislikes)
  const [vote, setVote] = useState<"like" | "dislike" | null>(userVote)
  const [isLoading, setIsLoading] = useState(false)

  const handleVote = async (type: "like" | "dislike") => {
    if (isLoading) return
    
    setIsLoading(true)
    
    try {
      const res = await fetch(`/api/articles/${articleId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type })
      })

      if (res.ok) {
        const data = await res.json()
        
        // Update local state
        if (vote === type) {
          // Remove vote
          setVote(null)
          if (type === "like") setLikes(prev => prev - 1)
          else setDislikes(prev => prev - 1)
          toast.info("Vote removed")
        } else {
          // Change vote
          if (vote === "like") {
            setLikes(prev => prev - 1)
            setDislikes(prev => prev + 1)
          } else if (vote === "dislike") {
            setDislikes(prev => prev - 1)
            setLikes(prev => prev + 1)
          } else {
            // New vote
            if (type === "like") setLikes(prev => prev + 1)
            else setDislikes(prev => prev + 1)
          }
          setVote(type)
          toast.success(type === "like" ? "Article liked!" : "Article disliked")
        }
      }
    } catch (error) {
      toast.error("Failed to vote. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-8 pt-8 divider-gradient">
      <p className="text-sm text-muted-foreground mb-4">Was this helpful?</p>
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => handleVote("like")}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
            vote === "like" 
              ? "bg-emerald-500/20 text-emerald-400" 
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="font-medium">{likes}</span>
        </button>

        <button
          onClick={() => handleVote("dislike")}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
            vote === "dislike" 
              ? "bg-red-500/20 text-red-400" 
              : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
        >
          <ThumbsDown className="w-4 h-4" />
          <span className="font-medium">{dislikes}</span>
        </button>
      </div>
    </div>
  )
}
