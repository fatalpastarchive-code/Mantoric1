import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { users } from "@/lib/db/collections"
import { ObjectId } from "mongodb"

// GET /api/user/respect - Check if user can give respect and their respect points
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const usersCol = await users()
    const user = await usersCol.findOne({ clerkId: userId })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user can give respect (30-day cooldown)
    const now = new Date()
    const lastRespectGiven = user.lastRespectGivenAt || (user as any).lastRespectGivenDate
    let canGiveRespect = true
    let daysRemaining = 0

    if (lastRespectGiven) {
      const daysSinceLastRespect = Math.floor(
        (now.getTime() - new Date(lastRespectGiven).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceLastRespect < 30) {
        canGiveRespect = false
        daysRemaining = 30 - daysSinceLastRespect
      }
    }

    return NextResponse.json({
      respectPoints: user.respectPoints || 0,
      canGiveRespect,
      daysRemaining,
      lastRespectGivenAt: user.lastRespectGivenAt
    })
  } catch (error) {
    console.error("[GET /api/user/respect]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/user/respect - Give respect to another user
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { targetUserId } = await request.json()
    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID is required" }, { status: 400 })
    }

    // Prevent self-respect
    if (userId === targetUserId) {
      return NextResponse.json({ error: "Cannot give respect to yourself" }, { status: 400 })
    }

    const usersCol = await users()

    // Check if current user can give respect
    const currentUser = await usersCol.findOne({ clerkId: userId })
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const now = new Date()
    const lastRespectGiven = currentUser.lastRespectGivenAt || (currentUser as any).lastRespectGivenDate

    if (lastRespectGiven) {
      const daysSinceLastRespect = Math.floor(
        (now.getTime() - new Date(lastRespectGiven).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceLastRespect < 30) {
        const daysRemaining = 30 - daysSinceLastRespect
        return NextResponse.json(
          { error: `You can give respect again in ${daysRemaining} days`, daysRemaining },
          { status: 429 }
        )
      }
    }

    // Find target user
    let targetUser
    try {
      targetUser = await usersCol.findOne({ _id: new ObjectId(targetUserId) })
    } catch {
      targetUser = await usersCol.findOne({ clerkId: targetUserId })
    }

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 })
    }

    // Update target user's respect points
    await usersCol.updateOne(
      { _id: targetUser._id },
      { $inc: { respectPoints: 1 } }
    )

    // Update current user's last respect given date
    await usersCol.updateOne(
      { _id: currentUser._id },
      { $set: { lastRespectGivenAt: now, lastRespectGivenDate: now } }
    )

    return NextResponse.json({
      success: true,
      message: "Respect given successfully",
      targetUserRespectPoints: (targetUser.respectPoints || 0) + 1
    })
  } catch (error) {
    console.error("[POST /api/user/respect]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
