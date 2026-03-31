"use server"

import { articles, culturalReviews, users } from "@/lib/db/collections"
import type { Article, CulturalReview } from "@/lib/db/schema"

export interface StreamItem {
  id: string
  type: "article" | "cultural" | "forum"
  data: Article | CulturalReview | any
  createdAt: Date
}

export async function fetchInfiniteStream(limit: number = 20): Promise<StreamItem[]> {
  const [articlesCol, reviewsCol, usersCol] = await Promise.all([
    articles(),
    culturalReviews(),
    users()
  ])

  // Fetch articles and cultural reviews in parallel
  const [articleDocs, reviewDocs] = await Promise.all([
    articlesCol
      .find({ status: "published" })
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .toArray(),
    reviewsCol
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
  ])

  // Get unique userIds from reviews
  const userIds = [...new Set(reviewDocs.map(r => r.userId))]
  
  // Fetch author data for reviews
  const userDocs = await usersCol
    .find({ clerkId: { $in: userIds } })
    .toArray()
  
  const userMap = new Map(userDocs.map(u => [u.clerkId, u]))

  // Convert to stream items
  const articleItems: StreamItem[] = articleDocs.map((article: any) => ({
    id: article._id?.toString() || article._id,
    type: "article",
    data: {
      ...article,
      _id: article._id?.toString() || article._id,
      createdAt: article.createdAt instanceof Date ? article.createdAt.toISOString() : article.createdAt,
      updatedAt: article.updatedAt instanceof Date ? article.updatedAt.toISOString() : article.updatedAt,
      publishedAt: article.publishedAt instanceof Date ? article.publishedAt.toISOString() : article.publishedAt,
    } as Article,
    createdAt: article.publishedAt || article.createdAt
  }))

  const reviewItems: StreamItem[] = reviewDocs.map((review: any) => {
    const author = userMap.get(review.userId)
    
    return {
      id: review._id?.toString() || review._id,
      type: "cultural",
      data: {
        ...review,
        _id: review._id?.toString() || review._id,
        createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt,
        author: author ? {
          id: author._id?.toString() || author._id,
          clerkId: author.clerkId,
          username: author.username,
          name: author.displayName || author.name || "Anonymous",
          avatar: author.avatar,
          rank: author.rank || "newbie",
          xp: author.xp || 0,
          respectPoints: author.respectPoints || 0,
          bio: author.bio
        } : undefined
      } as CulturalReview & { author?: any },
      createdAt: review.createdAt
    }
  })

  // Interleave and sort by date (newest first)
  const allItems = [...articleItems, ...reviewItems]
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime()
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime()
      return dateB - dateA
    })
    .slice(0, limit)

  return allItems
}
