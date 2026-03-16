import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { users, userReviews, activityLogs } from "@/lib/db/collections"

// GET - Fetch reviews for a user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params
    
    const reviewsCol = await userReviews()
    const usersCol = await users()
    
    // Fetch reviews for this user
    const reviews = await reviewsCol
      .find({ targetUserId })
      .sort({ createdAt: -1 })
      .toArray()
    
    // Enrich with reviewer info
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        const reviewer = await usersCol.findOne({ clerkId: review.reviewerId })
        return {
          id: review._id.toString(),
          reviewerId: review.reviewerId,
          reviewerName: reviewer?.displayName || reviewer?.username || "Anonymous",
          reviewerAvatar: reviewer?.avatar,
          rating: review.rating,
          content: review.content,
          helpfulCount: review.helpfulCount || 0,
          createdAt: review.createdAt,
        }
      })
    )
    
    // Calculate stats
    const total = enrichedReviews.length
    const average = total > 0 
      ? enrichedReviews.reduce((sum, r) => sum + r.rating, 0) / total 
      : 0
    const breakdown = [0, 0, 0, 0, 0]
    enrichedReviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        breakdown[5 - r.rating]++
      }
    })
    
    return NextResponse.json({ 
      reviews: enrichedReviews,
      stats: { average, total, breakdown }
    })
  } catch (error) {
    console.error("[GET /api/user/[userId]/reviews]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST - Submit a review
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId: targetUserId } = await params
    
    // Prevent self-reviews
    if (userId === targetUserId) {
      return NextResponse.json({ error: "Cannot review yourself" }, { status: 400 })
    }

    const body = await req.json()
    const { rating, content } = body

    if (!rating || !content?.trim()) {
      return NextResponse.json({ error: "Rating and content required" }, { status: 400 })
    }

    const reviewsCol = await userReviews()
    const usersCol = await users()
    const logsCol = await activityLogs()

    // Check if already reviewed
    const existing = await reviewsCol.findOne({ 
      reviewerId: userId, 
      targetUserId 
    })
    
    if (existing) {
      return NextResponse.json({ error: "Already reviewed this user" }, { status: 400 })
    }

    // Create review
    const newReview = {
      _id: crypto.randomUUID(),
      reviewerId: userId,
      targetUserId,
      rating,
      content: content.trim(),
      helpfulCount: 0,
      createdAt: new Date(),
    }

    await reviewsCol.insertOne(newReview as any)

    // Award XP to reviewer
    const xpReward = 5
    await usersCol.updateOne(
      { clerkId: userId },
      { $inc: { xp: xpReward } }
    )

    // Log activity
    await logsCol.insertOne({
      _id: crypto.randomUUID(),
      userId,
      action: "author_review",
      targetId: targetUserId,
      targetType: "user",
      xpAwarded: xpReward,
      createdAt: new Date(),
    } as any)

    // Recalculate stats
    const allReviews = await reviewsCol.find({ targetUserId }).toArray()
    const total = allReviews.length
    const average = total > 0 
      ? allReviews.reduce((sum, r) => sum + r.rating, 0) / total 
      : 0
    const breakdown = [0, 0, 0, 0, 0]
    allReviews.forEach(r => {
      if (r.rating >= 1 && r.rating <= 5) {
        breakdown[5 - r.rating]++
      }
    })

    // Get reviewer info for response
    const reviewer = await usersCol.findOne({ clerkId: userId })

    return NextResponse.json({ 
      review: {
        id: newReview._id,
        reviewerId: userId,
        reviewerName: reviewer?.displayName || reviewer?.username || "Anonymous",
        reviewerAvatar: reviewer?.avatar,
        rating: newReview.rating,
        content: newReview.content,
        helpfulCount: 0,
        createdAt: newReview.createdAt,
      },
      stats: { average, total, breakdown },
      xpAwarded: xpReward
    })
  } catch (error) {
    console.error("[POST /api/user/[userId]/reviews]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
