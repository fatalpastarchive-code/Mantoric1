import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { users, respects, activityLogs } from "@/lib/db/collections"

// GET - Get reputation given status for an author
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params
    const { userId: currentUserId } = await auth()

    const repsCol = await respects()
    const usersCol = await users()

    // Get target user's reputation
    const targetUser = await usersCol.findOne({ 
      $or: [{ clerkId: targetUserId }, { _id: targetUserId as any }]
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const reputationScore = targetUser.reputation || targetUser.hype || 0

    // Check if current user has already given reputation
    let hasGivenReputation = false
    let givenAmount = 0

    if (currentUserId) {
      const existingRep = await repsCol.findOne({
        giverId: currentUserId,
        receiverId: targetUserId
      })
      if (existingRep) {
        hasGivenReputation = true
        givenAmount = existingRep.amount
      }
    }

    // Get total givers count
    const totalGivers = await repsCol.countDocuments({ receiverId: targetUserId })

    return NextResponse.json({
      reputation: reputationScore,
      hasGivenReputation,
      givenAmount,
      totalGivers,
      isOwnProfile: currentUserId === targetUserId
    })
  } catch (error) {
    console.error("[GET /api/user/[userId]/reputation]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST - Give reputation to an author (once per user)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: currentUserId } = await auth()
    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId: targetUserId } = await params

    // Prevent self-reputation
    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: "Cannot give reputation to yourself" }, { status: 400 })
    }

    const { amount } = await req.json()
    if (!amount || (amount !== 1 && amount !== -1)) {
      return NextResponse.json({ error: "Invalid amount. Must be 1 or -1" }, { status: 400 })
    }

    const repsCol = await respects()
    const usersCol = await users()
    const logsCol = await activityLogs()

    // Check if already given reputation to this user
    const existingRep = await repsCol.findOne({
      giverId: currentUserId,
      receiverId: targetUserId
    })

    if (existingRep) {
      return NextResponse.json({ 
        error: "You have already given reputation to this user",
        currentAmount: existingRep.amount
      }, { status: 400 })
    }

    // Create reputation record
    await repsCol.insertOne({
      _id: crypto.randomUUID(),
      giverId: currentUserId,
      receiverId: targetUserId,
      amount: amount,
      createdAt: new Date()
    } as any)

    // Update target user's reputation
    await usersCol.updateOne(
      { $or: [{ clerkId: targetUserId }, { _id: targetUserId as any }] },
      { $inc: { reputation: amount } }
    )

    // Log activity
    await logsCol.insertOne({
      _id: crypto.randomUUID(),
      userId: currentUserId,
      action: "reputation_given",
      targetId: targetUserId,
      targetType: "user",
      xpAwarded: 0,
      metadata: { amount },
      createdAt: new Date()
    } as any)

    return NextResponse.json({
      success: true,
      reputation: amount,
      message: amount > 0 ? "Reputation increased!" : "Reputation decreased."
    })
  } catch (error) {
    console.error("[POST /api/user/[userId]/reputation]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
