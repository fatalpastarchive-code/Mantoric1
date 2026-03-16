"use client"

import { useState, useEffect } from "react"
import { Star, ThumbsUp, MessageSquare, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"

interface Review {
  id: string
  reviewerId: string
  reviewerName: string
  reviewerAvatar?: string
  rating: number
  content: string
  helpfulCount: number
  createdAt: Date
  isHelpful?: boolean
}

interface AuthorReviewsProps {
  authorId: string
  authorName: string
  isOwnProfile: boolean
}

export function AuthorReviews({ authorId, authorName, isOwnProfile }: AuthorReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showWriteReview, setShowWriteReview] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 0, content: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stats, setStats] = useState({ average: 0, total: 0, breakdown: [0, 0, 0, 0, 0] })

  useEffect(() => {
    fetchReviews()
  }, [authorId])

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/user/${authorId}/reviews`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data.reviews || [])
        setStats(data.stats || { average: 0, total: 0, breakdown: [0, 0, 0, 0, 0] })
      }
    } catch (error) {
      console.error("Failed to fetch reviews", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (newReview.rating === 0) {
      toast.error("Please select a rating")
      return
    }
    if (!newReview.content.trim()) {
      toast.error("Please write a review")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/user/${authorId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      })

      if (res.ok) {
        const data = await res.json()
        setReviews(prev => [data.review, ...prev])
        setStats(data.stats)
        setNewReview({ rating: 0, content: "" })
        setShowWriteReview(false)
        toast.success("Review submitted! +5 XP awarded")
      }
    } catch (error) {
      toast.error("Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleHelpful = async (reviewId: string) => {
    try {
      const res = await fetch(`/api/user/${authorId}/reviews/${reviewId}/helpful`, {
        method: "POST",
      })

      if (res.ok) {
        setReviews(prev => prev.map(r => 
          r.id === reviewId 
            ? { ...r, helpfulCount: r.helpfulCount + 1, isHelpful: true }
            : r
        ))
      }
    } catch (error) {
      console.error("Failed to mark helpful", error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 animate-pulse rounded-xl bg-secondary/50" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="p-6 rounded-2xl bg-secondary/20 border border-border/30">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-black text-foreground">{stats.average.toFixed(1)}</p>
            <div className="flex gap-0.5 justify-center mt-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={cn(
                    "h-4 w-4",
                    stats.average >= star ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats.total} reviews</p>
          </div>

          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star, idx) => {
              const count = stats.breakdown[5 - star] || 0
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-3">{star}</span>
                  <Star className="h-3 w-3 text-yellow-500" />
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-6">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Write Review Button */}
      {!isOwnProfile && !showWriteReview && (
        <Button
          onClick={() => setShowWriteReview(true)}
          className="w-full rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Write a Review
        </Button>
      )}

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="p-6 rounded-2xl bg-secondary/20 border border-border/30 space-y-4">
          <h3 className="font-bold">Review {authorName}</h3>
          
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setNewReview({ ...newReview, rating: star })}
                className="p-1"
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-all",
                    newReview.rating >= star
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-muted-foreground/30 hover:text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>

          <textarea
            value={newReview.content}
            onChange={e => setNewReview({ ...newReview, content: e.target.value })}
            placeholder="Share your experience with this author's work..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border/50 focus:border-primary focus:outline-none resize-none"
          />

          <div className="flex gap-2">
            <Button
              onClick={() => setShowWriteReview(false)}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-secondary/20 border border-border/30">
            <User className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No reviews yet</p>
            {!isOwnProfile && (
              <p className="text-sm text-muted-foreground/60 mt-1">
                Be the first to review this author
              </p>
            )}
          </div>
        ) : (
          reviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              onHelpful={() => handleHelpful(review.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Review Card Component
interface ReviewCardProps {
  review: Review
  onHelpful: () => void
}

function ReviewCard({ review, onHelpful }: ReviewCardProps) {
  return (
    <div className="p-6 rounded-2xl bg-secondary/20 border border-border/30">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-accent overflow-hidden shrink-0">
          {review.reviewerAvatar ? (
            <img src={review.reviewerAvatar} alt={review.reviewerName} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center font-bold">
              {review.reviewerName.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">{review.reviewerName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
            </span>
          </div>
          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={cn(
                  "h-3 w-3",
                  review.rating >= star ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <p className="mt-3 text-sm text-foreground/90 leading-relaxed">{review.content}</p>
          
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={onHelpful}
              disabled={review.isHelpful}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium transition-colors",
                review.isHelpful 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ThumbsUp className="h-4 w-4" />
              Helpful ({review.helpfulCount})
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
