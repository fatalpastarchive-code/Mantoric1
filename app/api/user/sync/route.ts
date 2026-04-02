import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { users } from "@/lib/db/collections"

const EARLY_SUPPORTER_THRESHOLD = 1000

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const clerkUser = await currentUser()
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const usersCol = await users()

    const existing = await usersCol.findOne({ clerkId: userId })
    if (existing) {
      return NextResponse.json({ success: true, created: false })
    }

    // Check total user count to determine EARLY_SUPPORTER eligibility
    const totalUsers = await usersCol.countDocuments({})
    const isEarlySupporter = totalUsers < EARLY_SUPPORTER_THRESHOLD

    const now = new Date()
    const initialBadges = isEarlySupporter ? ["EARLY_SUPPORTER"] : []

    const newUser = {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      name: clerkUser.fullName || clerkUser.username || "Unknown",
      image: clerkUser.imageUrl,
      emailVerified: null,
      username: clerkUser.username || undefined,
      passwordHash: undefined,
      displayName: clerkUser.fullName || undefined,
      avatar: clerkUser.imageUrl,
      bannerUrl: "",
      bio: "",
      statusNote: "",
      followersCount: 0,
      followingCount: 0,
      xp: 0,
      level: 1,
      rank: "Citizen",
      role: "CITIZEN",
      badges: initialBadges,
      respectPoints: 0,
      isPostBanned: false,
      hasInteractedWithDonation: false,
      donationIntentAmount: 0,
      donationChoice: null,
      articlesRead: 0,
      commentsCount: 0,
      likesGiven: 0,
      likesReceived: 0,
      isVerified: false,
      verificationCode: undefined,
      verificationCodeExpiresAt: undefined,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    }

    await usersCol.insertOne(newUser as any)

    return NextResponse.json({ 
      success: true, 
      created: true, 
      isEarlySupporter,
      totalUsers: totalUsers + 1
    })
  } catch (error) {
    console.error("[POST /api/user/sync]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

