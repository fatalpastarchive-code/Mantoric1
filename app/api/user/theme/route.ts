import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { users, activityLogs } from "@/lib/db/collections"

// Valid theme IDs
const VALID_THEMES = ["default", "emerald", "amber", "ruby", "diamond", "caesar"]

// Theme unlock requirements
const THEME_REQUIREMENTS: Record<string, { type: string; value: number | string | boolean }> = {
  default: { type: "xp", value: 0 },
  emerald: { type: "xp", value: 100 },
  amber: { type: "xp", value: 250 },
  ruby: { type: "xp", value: 500 },
  diamond: { type: "rank", value: "Diamond" },
  caesar: { type: "premium", value: true }
}

// POST - Set active theme
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { themeId } = await req.json()

    if (!VALID_THEMES.includes(themeId)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 })
    }

    const usersCol = await users()
    const user = await usersCol.findOne({ clerkId: userId })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user has unlocked the theme
    const requirement = THEME_REQUIREMENTS[themeId]
    let isUnlocked = false

    switch (requirement.type) {
      case "xp":
        isUnlocked = (user.xp || 0) >= (requirement.value as number)
        break
      case "rank":
        isUnlocked = user.rank === requirement.value
        break
      case "premium":
        isUnlocked = (user as any).isPremium || false
        break
    }

    // Default theme is always unlocked
    if (themeId === "default") {
      isUnlocked = true
    }

    if (!isUnlocked) {
      return NextResponse.json({ 
        error: "Theme not unlocked",
        requirement: requirement
      }, { status: 403 })
    }

    // Update active theme
    await usersCol.updateOne(
      { clerkId: userId },
      { $set: { activeTheme: themeId } }
    )

    return NextResponse.json({ 
      success: true,
      themeId
    })
  } catch (error) {
    console.error("[POST /api/user/theme]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// GET - Get available themes for user
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

    const themes = VALID_THEMES.map(themeId => {
      const requirement = THEME_REQUIREMENTS[themeId]
      let isUnlocked = false

      switch (requirement.type) {
        case "xp":
          isUnlocked = (user.xp || 0) >= (requirement.value as number)
          break
        case "rank":
          isUnlocked = user.rank === requirement.value
          break
        case "premium":
          isUnlocked = (user as any).isPremium || false
          break
      }

      if (themeId === "default") isUnlocked = true

      return {
        id: themeId,
        isUnlocked,
        isActive: user.activeTheme === themeId || (themeId === "default" && !user.activeTheme),
        requirement
      }
    })

    return NextResponse.json({ themes })
  } catch (error) {
    console.error("[GET /api/user/theme]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
