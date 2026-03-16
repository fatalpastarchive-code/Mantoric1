import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { users, activityLogs } from "@/lib/db/collections"

// POST - Save onboarding interests
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { interests } = await req.json()

    if (!interests || !Array.isArray(interests) || interests.length < 3) {
      return NextResponse.json({ error: "At least 3 interests are required" }, { status: 400 })
    }

    const usersCol = await users()
    const logsCol = await activityLogs()

    // Check if already completed onboarding
    const user = await usersCol.findOne({ clerkId: userId })
    const isFirstCompletion = !user?.onboardingCompleted

    // Update user interests and mark onboarding complete
    await usersCol.updateOne(
      { clerkId: userId },
      { 
        $set: { 
          interests,
          onboardingCompleted: true,
          updatedAt: new Date()
        } 
      }
    )

    // Award XP for first completion only
    let xpAwarded = 0
    if (isFirstCompletion) {
      xpAwarded = 25
      await usersCol.updateOne(
        { clerkId: userId },
        { $inc: { xp: xpAwarded } }
      )

      // Log activity
      await logsCol.insertOne({
        _id: crypto.randomUUID(),
        userId,
        action: "onboarding_completed",
        targetType: "user",
        xpAwarded,
        metadata: { interests },
        createdAt: new Date(),
      } as any)
    }

    return NextResponse.json({ 
      success: true,
      xpAwarded,
      isFirstCompletion
    })
  } catch (error) {
    console.error("[POST /api/user/onboarding]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// GET - Check onboarding status
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const usersCol = await users()
    const user = await usersCol.findOne({ clerkId: userId })

    if (!user) {
      return NextResponse.json({ 
        needsOnboarding: true,
        interests: []
      })
    }

    const needsOnboarding = !user.onboardingCompleted || (user.interests || []).length < 3

    return NextResponse.json({
      needsOnboarding,
      interests: user.interests || [],
      onboardingCompleted: user.onboardingCompleted || false
    })
  } catch (error) {
    console.error("[GET /api/user/onboarding]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
