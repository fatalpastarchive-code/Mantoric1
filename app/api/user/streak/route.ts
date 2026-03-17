import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { users } from "@/lib/db/collections"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const usersCol = await users()
    const user = await usersCol.findOne({ clerkId: userId })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const now = new Date()
    const lastRead = user.lastAxiomReadAt ? new Date(user.lastAxiomReadAt) : null
    
    let newStreak = user.streak || 0
    let streakUpdated = false

    if (!lastRead) {
      newStreak = 1
      streakUpdated = true
    } else {
      const diffTime = now.getTime() - lastRead.getTime()
      const diffDays = diffTime / (1000 * 3600 * 24)

      if (diffDays >= 1 && diffDays < 2) {
        // Exactly one day later (or within the 24-48h window)
        newStreak += 1
        streakUpdated = true
      } else if (diffDays >= 2) {
        // Reset streak if more than 48 hours passed
        newStreak = 1
        streakUpdated = true
      }
      // If diffDays < 1, already read today, no change
    }

    if (streakUpdated) {
      await usersCol.updateOne(
        { clerkId: userId },
        { 
          $set: { 
            streak: newStreak,
            lastAxiomReadAt: now
          } 
        }
      )
    }

    return NextResponse.json({ streak: newStreak, updated: streakUpdated })
  } catch (error) {
    console.error("Streak error:", error)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
