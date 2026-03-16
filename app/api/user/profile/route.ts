import { NextRequest, NextResponse } from "next/server"
import { users } from "@/lib/db/collections"

// GET - Get user profile by username
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const usersCol = await users()
    const user = await usersCol.findOne({ username })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.clerkId || String(user._id),
        username: user.username,
        name: user.displayName || user.name,
        avatar: user.avatar || user.image,
        rank: user.rank || "Newbie",
        reputation: user.respectPoints || 0,
        respectPoints: user.respectPoints || 0,
        badgeLevel: user.badgeLevel || "Newbie",
        isVerifiedExpert: user.isVerifiedExpert || false,
        expertField: user.expertField || "",
        onboardingCompleted: user.onboardingCompleted || false,
      }
    })
  } catch (error) {
    console.error("[GET /api/user/profile]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
