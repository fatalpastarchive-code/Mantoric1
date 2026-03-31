"use client"

import { useState } from "react"
import { ArticleCard } from "@/components/feed/article-card"
import { CultureCard } from "@/components/cultural/culture-card"
import { DiscussArenaModal } from "@/components/cultural/discuss-arena-modal"
import type { StreamItem } from "@/lib/actions/stream-actions"
import type { CulturalReview } from "@/lib/db/schema"

interface InfiniteStreamProps {
  initialItems: StreamItem[]
}

export function InfiniteStream({ initialItems }: InfiniteStreamProps) {
  const [items] = useState<StreamItem[]>(initialItems)
  const [selectedReview, setSelectedReview] = useState<CulturalReview | null>(null)
  const [isDiscussModalOpen, setIsDiscussModalOpen] = useState(false)

  const handleDiscussInArena = (review: CulturalReview) => {
    setSelectedReview(review)
    setIsDiscussModalOpen(true)
  }

  return (
    <>
      <div className="flex flex-col divide-y divide-zinc-800/50">
        {items.map((item) => {
          if (item.type === "article") {
            const article = item.data as any
            return (
              <ArticleCard
                key={item.id}
                id={article._id}
                slug={article.slug}
                title={article.title}
                excerpt={article.excerpt || ""}
                imageUrl={article.imageUrl || ""}
                author={{
                  id: article.authorId,
                  name: article.authorName || "Anonymous",
                  rank: "Newbie",
                  xp: 0,
                }}
                category={article.category}
                likes={article.likesCount || 0}
                comments={article.commentsCount || 0}
                readTime={article.readTime || 1}
                createdAt={article.publishedAt || article.createdAt}
              />
            )
          }

          if (item.type === "cultural") {
            const review = item.data as CulturalReview
            return (
              <CultureCard
                key={item.id}
                review={review}
                isOwnProfile={false}
                onDiscussInArena={handleDiscussInArena}
              />
            )
          }

          return null
        })}
      </div>

      <DiscussArenaModal
        review={selectedReview}
        isOpen={isDiscussModalOpen}
        onClose={() => {
          setIsDiscussModalOpen(false)
          setSelectedReview(null)
        }}
      />
    </>
  )
}
