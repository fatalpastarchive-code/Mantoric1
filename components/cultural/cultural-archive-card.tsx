"use client"

import { useState } from "react"
import { BookOpen, Film, Star, Trash2, Quote } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { RespectWriterButton } from "@/components/respect/respect-writer-button"
import { deleteCulturalReview } from "@/lib/actions/cultural-review-actions"
import { toast } from "sonner"
import type { CulturalReview } from "@/lib/db/schema"

interface CulturalArchiveCardProps {
  review: CulturalReview
  isOwnProfile: boolean
  onDelete?: () => void
}

export function CulturalArchiveCard({ review, isOwnProfile, onDelete }: CulturalArchiveCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

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

  const TypeIcon = review.type === "BOOK" ? BookOpen : Film

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black border border-zinc-800/50 group">
      {/* Watermark */}
      <div className="absolute -bottom-4 -right-4 opacity-[0.03] pointer-events-none select-none">
        <span className="text-[120px] font-serif italic leading-none">M</span>
      </div>

      {/* Banner / Slim Poster Area */}
      <div className="relative h-32 w-full overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-950 to-black" />
        
        {/* Poster Image (blurred as background) */}
        <img
          src={review.imageUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm scale-110"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end p-4">
          <div className="flex items-end gap-4 w-full">
            {/* Poster Thumbnail */}
            <div className="relative h-24 w-16 rounded-lg overflow-hidden border border-zinc-700/50 shadow-2xl shrink-0 -mb-8">
              <img
                src={review.imageUrl}
                alt={review.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Title & Meta */}
            <div className="flex-1 pb-2 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <TypeIcon className="h-3 w-3 text-zinc-500" />
                <span className="text-[10px] uppercase tracking-widest text-zinc-600">
                  {review.type}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white truncate pr-8">
                {review.title}
              </h3>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-purple-500 text-purple-500" />
                  <span className="text-sm font-medium text-purple-400">
                    {review.rating}/10
                  </span>
                </div>
                <span className="text-xs text-zinc-600">
                  {new Date(review.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Respect Button */}
        <div className="absolute top-3 right-3">
          <RespectWriterButton
            targetUserId={review.userId}
            className="!p-1.5 !h-auto !w-auto !bg-black/50 !backdrop-blur-sm !border-zinc-700/50 hover:!bg-zinc-800/50 !text-[10px]"
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="pt-10 pb-4 px-4 space-y-4">
        {/* Axiom Quote */}
        {review.quote && (
          <div className="relative pl-4 border-l-2 border-purple-500/30">
            <Quote className="absolute -left-2.5 -top-1 h-4 w-4 text-purple-500/50" />
            <p className="text-sm italic text-zinc-400 leading-relaxed">
              &ldquo;{review.quote}&rdquo;
            </p>
          </div>
        )}

        {/* Review */}
        <div>
          <p
            className={cn(
              "text-sm text-zinc-300 leading-relaxed",
              !isExpanded && "line-clamp-3"
            )}
          >
            {review.review}
          </p>
          {review.review.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-zinc-500 hover:text-purple-400 mt-2 transition-colors"
            >
              {isExpanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>

        {/* Actions */}
        {isOwnProfile && (
          <div className="flex justify-end pt-2 border-t border-zinc-800/50">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="h-8 text-zinc-600 hover:text-red-400 hover:bg-red-950/20"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              {isDeleting ? "Removing..." : "Remove"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
