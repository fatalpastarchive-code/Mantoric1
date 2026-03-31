"use client"

import { useState, useCallback, useEffect } from "react"
import { Plus, Sparkles, BookOpen, Film } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CulturalArchiveModal } from "@/components/cultural/cultural-archive-modal"
import { CultureCard } from "@/components/cultural/culture-card"
import { DiscussArenaModal } from "@/components/cultural/discuss-arena-modal"
import { getUserCulturalReviews } from "@/lib/actions/cultural-review-actions"
import { useUser } from "@clerk/nextjs"
import type { CulturalReview } from "@/lib/db/schema"

export function CultureFeed() {
  const { user } = useUser()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reviews, setReviews] = useState<CulturalReview[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState<CulturalReview | null>(null)
  const [isDiscussModalOpen, setIsDiscussModalOpen] = useState(false)

  const loadReviews = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getUserCulturalReviews()
      if (result.success && result.reviews) {
        setReviews(result.reviews)
      }
    } catch (error) {
      console.error("Failed to load cultural reviews:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const handleSuccess = () => {
    loadReviews()
  }

  const handleDiscussInArena = (review: CulturalReview) => {
    setSelectedReview(review)
    setIsDiscussModalOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Create Button - Compact Style */}
      {user && (
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950/50 border border-zinc-800/50 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <BookOpen className="h-4 w-4 text-purple-400" />
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Film className="h-4 w-4 text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-white">Share your cultural wisdom</p>
              <p className="text-xs text-white/70">Books, films, series that shaped you</p>
            </div>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4 h-9"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create
          </Button>
        </div>
      )}

      {/* Reviews Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-pulse flex space-x-4">
            <div className="h-32 w-full bg-zinc-900 rounded-2xl" />
          </div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
            <Sparkles className="h-8 w-8 text-zinc-600" />
          </div>
          <div>
            <p className="text-zinc-400 font-medium">The archive awaits</p>
            <p className="text-sm text-zinc-600 mt-1">
              {user ? "Document your first cultural discovery" : "Sign in to share your cultural wisdom"}
            </p>
          </div>
          {user && (
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-900 rounded-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Entry
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {reviews.map((review) => (
            <CultureCard
              key={review._id}
              review={review}
              isOwnProfile={user?.id === review.userId}
              onDelete={handleSuccess}
              onDiscussInArena={handleDiscussInArena}
            />
          ))}
        </div>
      )}

      {/* Archive Modal */}
      <CulturalArchiveModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSuccess={handleSuccess}
      />

      {/* Discuss in Arena Modal */}
      <DiscussArenaModal
        review={selectedReview}
        isOpen={isDiscussModalOpen}
        onClose={() => {
          setIsDiscussModalOpen(false)
          setSelectedReview(null)
        }}
      />
    </div>
  )
}
