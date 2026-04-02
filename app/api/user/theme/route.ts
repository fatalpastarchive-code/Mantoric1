import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { users, activityLogs } from "@/lib/db/collections"

// Valid theme IDs
const VALID_THEMES = ["dark-purple", "classic-black", "emerald-stoic", "royal-gold", "imperial-white", "stellar-abyss"]

// Theme unlock requirements
const THEME_REQUIREMENTS: Record<string, { type: string; value: number | string | boolean }> = {
  "dark-purple": { type: "respect", value: 0 },
  "classic-black": { type: "respect", value: 50 },
  "imperial-white": { type: "respect", value: 500 },
  "emerald-stoic": { type: "respect", value: 100 },
  "royal-gold": { type: "respect", value: 250 },
  "stellar-abyss": { type: "premium", value: true },
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

    switch (requirement?.type) {
      case "respect":
        isUnlocked = (user.respectPoints || 0) >= (requirement.value as number)
        break
      case "rank":
        isUnlocked = user.rank === requirement.value
        break
      case "premium":
        isUnlocked = (user as any).isPremium || false
        break
    }

    // Free themes are always unlocked
    if (themeId === "dark-purple" || themeId === "classic-black" || themeId === "imperial-white") {
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

      switch (requirement?.type) {
        case "respect":
          isUnlocked = (user.respectPoints || 0) >= (requirement.value as number)
          break
        case "rank":
          isUnlocked = user.rank === requirement.value
          break
        case "premium":
          isUnlocked = (user as any).isPremium || false
          break
      }

      const isForcedUnlock = (themeId === "dark-purple" || themeId === "classic-black" || themeId === "imperial-white")

      return {
        id: themeId,
        isUnlocked: isForcedUnlock || isUnlocked,
        isActive: user.activeTheme === themeId || (themeId === "dark-purple" && !user.activeTheme),
        requirement
      }
    })

    return NextResponse.json({ themes })
  } catch (error) {
    console.error("[GET /api/user/theme]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
