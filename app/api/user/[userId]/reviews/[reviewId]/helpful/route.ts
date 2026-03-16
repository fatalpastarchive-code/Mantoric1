import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { userReviews } from "@/lib/db/collections"

// POST - Mark review as helpful
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; reviewId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { reviewId } = await params

    const reviewsCol = await userReviews()
    
    // Increment helpful count
    await reviewsCol.updateOne(
      { _id: reviewId },
      { $inc: { helpfulCount: 1 } }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/user/[userId]/reviews/[reviewId]/helpful]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
