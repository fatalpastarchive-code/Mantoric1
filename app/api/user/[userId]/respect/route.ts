import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { users, respects } from "@/lib/db/collections"

// GET - Check if user can give respect and get target's respect count
export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const targetUserId = params.userId
    const session = await auth()
    
    const usersCol = await users()
    const respectsCol = await respects()
    
    // Get target user's respect points
    const targetUser = await usersCol.findOne({ clerkId: targetUserId })
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    const respectPoints = targetUser.respectPoints || 0
    
    // Check if current user can give respect (30-day cooldown)
    let canGiveRespect = false
    let hasGivenRespect = false
    let daysRemaining = 0
    
    if (session?.userId) {
      const currentUser = await usersCol.findOne({ clerkId: session.userId })
      if (currentUser) {
        const lastGiven = currentUser.lastRespectGivenAt || (currentUser as any).lastRespectGivenDate
        const now = new Date()
        
        if (!lastGiven) {
          canGiveRespect = true
        } else {
          const daysSinceLastRespect = Math.floor(
            (now.getTime() - new Date(lastGiven).getTime()) / (1000 * 60 * 60 * 24)
          )
          if (daysSinceLastRespect < 30) {
            canGiveRespect = false
            daysRemaining = 30 - daysSinceLastRespect
          } else {
            canGiveRespect = true
          }
        }
        
        // Check if already gave respect to this user
        const existingRespect = await respectsCol.findOne({
          giverId: session.userId,
          receiverId: targetUserId
        })
        hasGivenRespect = !!existingRespect
      }
    }
    
    return NextResponse.json({
      respectPoints,
      canGiveRespect: canGiveRespect && !hasGivenRespect,
      hasGivenRespect,
      daysRemaining,
      totalGivers: await respectsCol.countDocuments({ receiverId: targetUserId })
    })
  } catch (error) {
    console.error("[GET /api/user/respect] Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST - Give respect to a user
export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const targetUserId = params.userId
    const session = await auth()
    
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const giverId = session.userId
    
    // Prevent self-respect
    if (giverId === targetUserId) {
      return NextResponse.json({ error: "Cannot give respect to yourself" }, { status: 400 })
    }
    
    const usersCol = await users()
    const respectsCol = await respects()
    
    // Get current user
    const currentUser = await usersCol.findOne({ clerkId: giverId })
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Check if can give respect (30-day cooldown)
    const lastGiven = currentUser.lastRespectGivenAt || (currentUser as any).lastRespectGivenDate
    const now = new Date()
    
    if (lastGiven) {
      const daysSinceLastRespect = Math.floor(
        (now.getTime() - new Date(lastGiven).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (daysSinceLastRespect < 30) {
        const daysRemaining = 30 - daysSinceLastRespect
        return NextResponse.json(
          { error: `You can give Respect again in ${daysRemaining} days`, daysRemaining },
          { status: 429 }
        )
      }
    }
    
    // Check if already gave respect to this user
    const existingRespect = await respectsCol.findOne({
      giverId,
      receiverId: targetUserId
    })
    
    if (existingRespect) {
      return NextResponse.json(
        { error: "You have already given respect to this user" },
        { status: 409 }
      )
    }
    
    // Create respect record
    await respectsCol.insertOne({
      giverId,
      receiverId: targetUserId,
      givenAt: now
    })
    
    // Update giver's last respect given date
    await usersCol.updateOne(
      { clerkId: giverId },
      { $set: { lastRespectGivenAt: now, lastRespectGivenDate: now } }
    )
    
    // Update receiver's respectPoints
    await usersCol.updateOne(
      { clerkId: targetUserId },
      { $inc: { respectPoints: 1 } }
    )
    
    return NextResponse.json({
      success: true,
      message: "Respect given successfully"
    })
  } catch (error) {
    console.error("[POST /api/user/respect] Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
