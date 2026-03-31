"use client"

import { useState, useEffect } from "react"
import { X, Film, BookOpen, MessageSquare, ExternalLink } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import type { CulturalReview } from "@/lib/db/schema"

interface DiscussArenaModalProps {
  review: CulturalReview | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function DiscussArenaModal({ review, isOpen, onClose, onSuccess }: DiscussArenaModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when review changes
  useEffect(() => {
    if (review) {
      setTitle(`[Discussion] ${review.title}`)
      setContent(generatePrefilledContent(review))
    }
  }, [review])

  if (!review) return null

  const TypeIcon = review.type === "BOOK" ? BookOpen : Film
  const typeLabel = review.type === "BOOK" ? "Book" : review.type === "MOVIE" ? "Film" : "Series"

  function generatePrefilledContent(review: CulturalReview): string {
    const lines = [
      `I just finished experiencing **${review.title}** and wanted to share my thoughts with the community.`,
      "",
      `**My Rating:** ${review.rating}/10 ⭐`,
      "",
    ]

    if (review.quote) {
      lines.push(`**Favorite Quote:**`)
      lines.push(`> "${review.quote}"`)
      lines.push("")
    }

    lines.push(`**My Review:**`)
    lines.push(review.review)
    lines.push("")
    lines.push("---")
    lines.push("*What did you think? Share your perspective below!*")

    return lines.join("\n")
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/forum/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category: "Cultural Analysis",
          relatedCultureId: review._id,
        }),
      })

      if (res.ok) {
        toast.success("Discussion created in Arena!")
        onSuccess?.()
        onClose()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to create discussion")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-white p-0 overflow-hidden">
        {/* Header with gradient */}
        <div className="relative bg-gradient-to-r from-purple-900/20 to-zinc-950 p-6 border-b border-zinc-800">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <MessageSquare className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  Discuss in Arena
                </DialogTitle>
                <p className="text-sm text-zinc-500">
                  Start a forum discussion about this {typeLabel.toLowerCase()}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Culture Card Preview */}
          <div className="flex gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <div className="relative h-24 w-16 rounded-lg overflow-hidden shrink-0">
              <img
                src={review.imageUrl}
                alt={review.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <TypeIcon className="h-4 w-4 text-zinc-500" />
                <span className="text-xs text-zinc-500 uppercase tracking-wider">{typeLabel}</span>
              </div>
              <h4 className="font-semibold text-white truncate">{review.title}</h4>
              <div className="flex items-center gap-1 mt-1">
                {[...Array(10)].map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-xs",
                      i < review.rating ? "text-purple-400" : "text-zinc-700"
                    )}
                  >
                    ★
                  </span>
                ))}
                <span className="text-xs text-purple-400 ml-1">{review.rating}/10</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-400 mb-2 block">
                Discussion Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a compelling title..."
                className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-500/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-400 mb-2 block">
                Your Thoughts
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your detailed analysis..."
                className="min-h-[200px] bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-500/50 resize-none"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800">
                Category: Cultural Analysis
              </span>
              <span className="px-2 py-1 bg-zinc-900 rounded border border-zinc-800">
                Linked to {typeLabel}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Creating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Post to Arena
                </span>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
