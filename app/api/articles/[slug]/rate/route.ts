import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { articles } from "@/lib/db/collections"
import { ObjectId } from "mongodb"

// POST /api/articles/[slug]/rate
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    const { rating } = await request.json()
    
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const col = await articles()
    
    let article
    try {
      article = await col.findOne({ _id: new ObjectId(slug) })
    } catch {
      article = await col.findOne({ _id: slug, slug: slug })
    }
    
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    // Check if user already rated
    const existingRatings = article.ratings || []
    const existingRating = existingRatings.find((r: any) => r.userId === userId)
    
    if (existingRating) {
      // Update existing rating
      await col.updateOne(
        { _id: article._id, "ratings.userId": userId },
        { $set: { "ratings.$.value": rating, "ratings.$.updatedAt": new Date().toISOString() } }
      )
    } else {
      // Add new rating
      await col.updateOne(
        { _id: article._id },
        { $push: { ratings: { userId, value: rating, createdAt: new Date().toISOString() } } }
      )
    }

    // Recalculate average
    const updatedArticle = await col.findOne({ _id: article._id })
    const ratings = updatedArticle?.ratings || []
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum: number, r: any) => sum + r.value, 0) / ratings.length 
      : 0

    await col.updateOne(
      { _id: article._id },
      { $set: { averageRating, ratingsCount: ratings.length } }
    )

    return NextResponse.json({ 
      success: true, 
      averageRating: Math.round(averageRating * 10) / 10,
      ratingsCount: ratings.length 
    })
  } catch (error) {
    console.error("[POST /api/articles/[slug]/rate]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
