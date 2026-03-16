import { NextRequest, NextResponse } from "next/server"
import { users } from "@/lib/db/collections"

// GET - Leaderboard by reputation
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const period = searchParams.get("period") || "all" // all, weekly, monthly

    const usersCol = await users()

    // Build query based on period
    let query: any = {}
    if (period === "weekly") {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      query.lastActiveAt = { $gte: weekAgo }
    } else if (period === "monthly") {
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      query.lastActiveAt = { $gte: monthAgo }
    }

    // Fetch top users by respectPoints
    const topUsers = await usersCol
      .find(query)
      .sort({ respectPoints: -1 })
      .limit(limit)
      .toArray()

    // Map to leaderboard entries
    const leaderboard = topUsers.map((user, index) => ({
      rank: index + 1,
      userId: user.clerkId || String(user._id),
      username: user.username || "unknown",
      displayName: user.displayName || user.name || "Anonymous",
      avatar: user.avatar || user.image || null,
      respectPoints: user.respectPoints || 0,
      badgeLevel: user.badgeLevel || "Newbie",
      articlesRead: user.articlesRead || 0,
      likesReceived: user.likesReceived || 0
    }))

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("[GET /api/leaderboard]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
