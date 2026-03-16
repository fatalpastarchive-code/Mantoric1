import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { users, activityLogs } from "@/lib/db/collections"
import { calculateReputation } from "@/lib/db/schema"

// Discord role thresholds
const DISCORD_ROLES = {
  NEWBIE: { name: "Novice", minRep: 0 },
  SCHOLAR: { name: "Scholar", minRep: 50 },
  PRAETOR: { name: "Praetor", minRep: 150 },
  SENATOR: { name: "Senator", minRep: 300 },
  CAESAR: { name: "Imperial", minRep: 500 }
}

// GET - Get Discord role eligibility for user
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

    const reputation = calculateReputation(
      user.xp || 0,
      (user as any).hype || 0,
      user.articlesRead || 0
    )

    // Determine eligible role
    let eligibleRole = DISCORD_ROLES.NEWBIE
    if (reputation >= DISCORD_ROLES.CAESAR.minRep) {
      eligibleRole = DISCORD_ROLES.CAESAR
    } else if (reputation >= DISCORD_ROLES.SENATOR.minRep) {
      eligibleRole = DISCORD_ROLES.SENATOR
    } else if (reputation >= DISCORD_ROLES.PRAETOR.minRep) {
      eligibleRole = DISCORD_ROLES.PRAETOR
    } else if (reputation >= DISCORD_ROLES.SCHOLAR.minRep) {
      eligibleRole = DISCORD_ROLES.SCHOLAR
    }

    // Get current Discord connection status
    const discordLinked = !!(user as any).discordId
    const currentRole = (user as any).discordRole || null

    return NextResponse.json({
      reputation,
      eligibleRole: eligibleRole.name,
      currentRole,
      discordLinked,
      thresholds: DISCORD_ROLES,
      nextRole: getNextRole(reputation)
    })
  } catch (error) {
    console.error("[GET /api/discord/role]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST - Sync Discord role
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { discordUserId, discordAccessToken } = await req.json()

    if (!discordUserId) {
      return NextResponse.json({ error: "Discord ID required" }, { status: 400 })
    }

    const usersCol = await users()
    const logsCol = await activityLogs()

    // Get user data
    const user = await usersCol.findOne({ clerkId: userId })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const reputation = calculateReputation(
      user.xp || 0,
      (user as any).hype || 0,
      user.articlesRead || 0
    )

    // Determine role
    let roleToAssign = DISCORD_ROLES.NEWBIE.name
    if (reputation >= DISCORD_ROLES.CAESAR.minRep) {
      roleToAssign = DISCORD_ROLES.CAESAR.name
    } else if (reputation >= DISCORD_ROLES.SENATOR.minRep) {
      roleToAssign = DISCORD_ROLES.SENATOR.name
    } else if (reputation >= DISCORD_ROLES.PRAETOR.minRep) {
      roleToAssign = DISCORD_ROLES.PRAETOR.name
    } else if (reputation >= DISCORD_ROLES.SCHOLAR.minRep) {
      roleToAssign = DISCORD_ROLES.SCHOLAR.name
    }

    // Store Discord connection
    await usersCol.updateOne(
      { clerkId: userId },
      { 
        $set: { 
          discordId: discordUserId,
          discordRole: roleToAssign,
          discordLinkedAt: new Date()
        } 
      }
    )

    // Log activity
    await logsCol.insertOne({
      _id: crypto.randomUUID(),
      userId,
      action: "discord_linked",
      targetType: "user",
      xpAwarded: 10,
      metadata: { 
        discordUserId,
        roleAssigned: roleToAssign,
        reputation
      },
      createdAt: new Date(),
    } as any)

    // Award XP for linking Discord
    await usersCol.updateOne(
      { clerkId: userId },
      { $inc: { xp: 10 } }
    )

    // Note: Actual Discord API role assignment would happen here
    // This requires Discord Bot token and server configuration
    // For now, we store the intended role and return success

    return NextResponse.json({
      success: true,
      roleAssigned: roleToAssign,
      reputation,
      message: `Discord linked! You qualify for the ${roleToAssign} role.`,
      xpAwarded: 10
    })
  } catch (error) {
    console.error("[POST /api/discord/role]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

function getNextRole(reputation: number): { name: string; needed: number } | null {
  if (reputation < DISCORD_ROLES.SCHOLAR.minRep) {
    return { 
      name: DISCORD_ROLES.SCHOLAR.name, 
      needed: DISCORD_ROLES.SCHOLAR.minRep - reputation 
    }
  }
  if (reputation < DISCORD_ROLES.PRAETOR.minRep) {
    return { 
      name: DISCORD_ROLES.PRAETOR.name, 
      needed: DISCORD_ROLES.PRAETOR.minRep - reputation 
    }
  }
  if (reputation < DISCORD_ROLES.SENATOR.minRep) {
    return { 
      name: DISCORD_ROLES.SENATOR.name, 
      needed: DISCORD_ROLES.SENATOR.minRep - reputation 
    }
  }
  if (reputation < DISCORD_ROLES.CAESAR.minRep) {
    return { 
      name: DISCORD_ROLES.CAESAR.name, 
      needed: DISCORD_ROLES.CAESAR.minRep - reputation 
    }
  }
  return null
}
