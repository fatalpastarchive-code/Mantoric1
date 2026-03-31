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
        mongoId: String(user._id),
        clerkId: user.clerkId || "",
        username: user.username,
        name: user.displayName || user.name,
        avatar: user.avatar || user.image,
        bannerUrl: user.bannerUrl || "",
        rank: user.rank || "Newbie",
        reputation: user.respectPoints || 0,
        respectPoints: user.respectPoints || 0,
        badgeLevel: user.badgeLevel || "Newbie",
        streak: user.streak || 0,
        followersCount: user.followersCount || 0,
        followingCount: user.followingCount || 0,
        isPremium: user.isPremium || false,
        subscriptionTier: user.subscriptionTier || "free",
        isVerifiedExpert: user.isVerifiedExpert || false,
        expertField: user.expertField || "",
        onboardingCompleted: user.onboardingCompleted || false,
        activeTheme: user.activeTheme || "dark-purple",
        unlockedThemes: user.unlockedThemes || ["dark-purple", "classic-black"],
      }
    })
  } catch (error) {
    console.error("[GET /api/user/profile]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
