"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@clerk/nextjs/server"
import { culturalReviews, users } from "@/lib/db/collections"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { ObjectId } from "mongodb"
import type { CulturalReview, CulturalType } from "@/lib/db/schema"

export interface CreateCulturalReviewInput {
  type: CulturalType
  externalId: string
  title: string
  imageUrl: string
  quote?: string
  review: string
  rating: number
}

export async function createCulturalReview(
  input: CreateCulturalReviewInput
): Promise<{ success: boolean; review?: CulturalReview; error?: string }> {
  const { userId } = await auth()
  
  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  // Validate rating is between 1-10
  if (input.rating < 1 || input.rating > 10) {
    return { success: false, error: "Rating must be between 1 and 10" }
  }

  try {
    const col = await culturalReviews()
    
    const newReview: Omit<CulturalReview, "_id"> = {
      userId,
      type: input.type,
      externalId: input.externalId,
      title: input.title,
      imageUrl: input.imageUrl,
      quote: input.quote,
      review: input.review,
      rating: input.rating,
      createdAt: new Date(),
    }

    const result = await col.insertOne(newReview as CulturalReview)
    
    const review: CulturalReview = {
      ...newReview,
      _id: result.insertedId.toString(),
    }

    revalidatePath(`/profile`)
    
    return { success: true, review }
  } catch (error) {
    console.error("[createCulturalReview] Error:", error)
    return { success: false, error: "Failed to create review" }
  }
}

export async function getUserCulturalReviews(
  targetUserId?: string
): Promise<{ success: boolean; reviews?: CulturalReview[]; error?: string }> {
  const { userId } = await auth()
  
  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  const userIdToQuery = targetUserId || userId

  try {
    const col = await culturalReviews()
    const usersCol = await users()
    
    const rawReviews = await col
      .find({ userId: userIdToQuery })
      .sort({ createdAt: -1 })
      .toArray()

    // Fetch author info
    const user = await usersCol.findOne({ clerkId: userIdToQuery })
    const authorInfo = user ? {
      id: user._id?.toString() || userIdToQuery,
      clerkId: user.clerkId || userIdToQuery,
      username: user.username || 'user',
      name: user.displayName || user.name || 'Anonymous',
      avatar: user.avatar || user.image || null,
      rank: user.rank || 'Newbie',
      xp: user.xp || 0,
      respectPoints: user.respectPoints || 0,
      bio: user.bio || null
    } : null

    // Serialize MongoDB objects to plain objects
    const reviews: CulturalReview[] = rawReviews.map((review: any) => ({
      _id: review._id?.toString() || review._id,
      userId: review.userId,
      type: review.type,
      externalId: review.externalId,
      title: review.title,
      imageUrl: review.imageUrl,
      quote: review.quote,
      review: review.review,
      rating: review.rating,
      createdAt: review.createdAt instanceof Date 
        ? review.createdAt.toISOString() 
        : review.createdAt,
      author: authorInfo
    }))

    return { success: true, reviews }
  } catch (error) {
    console.error("[getUserCulturalReviews] Error:", error)
    return { success: false, error: "Failed to fetch reviews" }
  }
}

export async function deleteCulturalReview(
  reviewId: string
): Promise<{ success: boolean; error?: string }> {
  const { userId } = await auth()
  
  if (!userId) {
    return { success: false, error: "Unauthorized" }
  }

  try {
      const col = await culturalReviews()
      
      // Caesar can delete any review, others only their own
      const query: any = { _id: new ObjectId(reviewId) as any }
      if (userId !== CAESAR_CLERK_ID) {
        query.userId = userId
      }

    const result = await col.deleteOne(query)

    if (result.deletedCount === 0) {
      return { success: false, error: "Review not found or not authorized" }
    }

    revalidatePath(`/profile`)
    
    return { success: true }
  } catch (error) {
    console.error("[deleteCulturalReview] Error:", error)
    return { success: false, error: "Failed to delete review" }
  }
}
