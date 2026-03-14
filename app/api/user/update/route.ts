import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { users } from "@/lib/db/collections"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await req.json().catch(() => null)) as {
      username?: string
      bio?: string
      bannerUrl?: string
      avatar?: string
    } | null

    if (!body) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 })
    }

    const usersCol = await users()

    // Ensure user exists in DB (sync-on-demand)
    const existingUser = await usersCol.findOne({ clerkId: userId })
    if (!existingUser) {
      const clerkUser = await currentUser()
      if (!clerkUser) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      const now = new Date()
      await usersCol.insertOne({
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
        rank: "Newbie",
        badges: [],
        articlesRead: 0,
        commentsCount: 0,
        likesGiven: 0,
        likesReceived: 0,
        role: "user",
        isVerified: false,
        verificationCode: undefined,
        verificationCodeExpiresAt: undefined,
        createdAt: now,
        updatedAt: now,
        lastActiveAt: now,
      } as any)
    }

    const updates: Record<string, unknown> = {}

    if (typeof body.bio === "string") {
      updates.bio = body.bio.slice(0, 160)
    }

    if (typeof body.bannerUrl === "string") {
      const trimmed = body.bannerUrl.trim()
      if (!trimmed) {
        updates.bannerUrl = ""
      } else {
        const imagePattern = /^https?:\/\/.+\.(gif|png|jpe?g|webp|avif)$/i
        if (!imagePattern.test(trimmed)) {
          return NextResponse.json(
            { error: "Banner URL must be a direct link to an image (gif, jpg, png, webp, avif)." },
            { status: 400 },
          )
        }
        updates.bannerUrl = trimmed
      }
    }

    if (typeof body.avatar === "string") {
      updates.avatar = body.avatar.trim()
    }

    if (typeof body.username === "string" && body.username.trim()) {
      const rawUsername = body.username.trim()
      const normalized = rawUsername.toLowerCase()

      // Basic validation: 3-24 chars, letters/numbers/underscore only
      if (!/^[a-zA-Z0-9_]{3,24}$/.test(rawUsername)) {
        return NextResponse.json(
          { error: "Username must be 3-24 characters and contain only letters, numbers or underscore." },
          { status: 400 },
        )
      }

      // Ensure uniqueness (no other user with same username)
      const existing = await usersCol.findOne({
        username: { $regex: `^${normalized}$`, $options: "i" },
        clerkId: { $ne: userId },
      })

      if (existing) {
        return NextResponse.json(
          { error: "This username is already taken." },
          { status: 409 },
        )
      }

      updates.username = rawUsername
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    const now = new Date()

    await usersCol.updateOne(
      { clerkId: userId },
      { $set: { ...updates, updatedAt: now } },
      { upsert: false },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[POST /api/user/update]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}

