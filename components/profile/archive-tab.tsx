"use client"

import { useState, useCallback, useEffect } from "react"
import { Plus, Archive, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CulturalArchiveModal } from "@/components/cultural/cultural-archive-modal"
import { CulturalArchiveCard } from "@/components/cultural/cultural-archive-card"
import { getUserCulturalReviews } from "@/lib/actions/cultural-review-actions"
import type { CulturalReview } from "@/lib/db/schema"

interface ArchiveTabProps {
  userId: string
  isOwnProfile: boolean
}

export function ArchiveTab({ userId, isOwnProfile }: ArchiveTabProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reviews, setReviews] = useState<CulturalReview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadReviews = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await getUserCulturalReviews(userId)
      if (result.success && result.reviews) {
        setReviews(result.reviews)
      }
    } catch (error) {
      console.error("Failed to load cultural reviews:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const handleSuccess = () => {
    loadReviews()
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      {isOwnProfile && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Cultural Archive</h2>
            <p className="text-sm text-zinc-500">
              Document your books, films, and series
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      )}

      {/* Reviews Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-zinc-900 flex items-center justify-center">
            <Archive className="h-8 w-8 text-zinc-600" />
          </div>
          <div>
            <p className="text-zinc-400 font-medium">
              {isOwnProfile ? "Your archive is empty" : "No cultural entries yet"}
            </p>
            <p className="text-sm text-zinc-600 mt-1">
              {isOwnProfile
                ? "Start documenting your cultural journey"
                : "This user hasn't added any cultural entries"}
            </p>
          </div>
          {isOwnProfile && (
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-900"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Entry
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <CulturalArchiveCard
              key={review._id}
              review={review}
              isOwnProfile={isOwnProfile}
              onDelete={handleSuccess}
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
    </div>
  )
}
