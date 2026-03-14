import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { auth } from "@clerk/nextjs/server"
import { follows, users } from "@/lib/db/collections"

export async function POST(request: NextRequest) {
  try {
    const { userId: followerId } = await auth()
    if (!followerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { targetUserId } = body as { targetUserId: string }

    if (!targetUserId) {
      return NextResponse.json({ error: "targetUserId is required" }, { status: 400 })
    }

    if (followerId === targetUserId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 })
    }

    const followsCol = await follows()
    const usersCol = await users()

    const existingFollow = await followsCol.findOne({
      followerId,
      followingId: targetUserId,
    })

    let isFollowing = false

    if (existingFollow) {
      // Unfollow
      await followsCol.deleteOne({ _id: existingFollow._id })
      
      // Update counts
      await usersCol.updateOne(
        { clerkId: followerId },
        { $inc: { followingCount: -1 } }
      )
      await usersCol.updateOne(
        { _id: new ObjectId(targetUserId) as any },
        { $inc: { followersCount: -1 } }
      )
      
      isFollowing = false
    } else {
      // Follow
      await followsCol.insertOne({
        _id: new ObjectId().toString(),
        followerId,
        followingId: targetUserId,
        createdAt: new Date(),
      } as any)

      // Update counts
      await usersCol.updateOne(
        { clerkId: followerId },
        { $inc: { followingCount: 1 } }
      )
      await usersCol.updateOne(
        { _id: new ObjectId(targetUserId) as any },
        { $inc: { followersCount: 1 } }
      )

      isFollowing = true
    }

    return NextResponse.json({ isFollowing })
  } catch (error) {
    console.error("[POST /api/follow]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
