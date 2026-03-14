/**
 * POST /api/respect
 *
 * Toggle "Respect" (like) on an article or comment.
 *
 * Body: { userId: string; targetId: string; targetType: "article" | "comment" }
 * Returns: { respected: boolean; newCount: number }
 */
import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { auth } from "@clerk/nextjs/server"
import { likes, articles, comments, users } from "@/lib/db/collections"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let body: any
    try {
      body = await request.json()
    } catch (e) {
      console.error("[POST /api/respect] Error parsing JSON:", e)
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
    }

    const { targetId, targetType } = body as {
      targetId: string
      targetType: "article" | "comment"
    }

    if (!targetId || !targetType) {
      return NextResponse.json(
        { error: "targetId and targetType are required" },
        { status: 400 }
      )
    }

    if (targetType !== "article" && targetType !== "comment") {
      return NextResponse.json(
        { error: "targetType must be 'article' or 'comment'" },
        { status: 400 }
      )
    }

    const likesCol = await likes()

    // Check if the user already respected this target
    const existing = await likesCol.findOne({
      userId,
      targetId,
      targetType,
    })

    let respected: boolean
    let newCount: number

    if (existing) {
      // --- Un-respect: remove the like ---
      await likesCol.deleteOne({ _id: existing._id })

      // Decrement likesCount on the target document
      if (targetType === "article") {
        const col = await articles()
        const result = await col.findOneAndUpdate(
          { _id: targetId as unknown as string },
          { $inc: { likesCount: -1 } },
          { returnDocument: "after" }
        )
        newCount = result?.likesCount ?? 0
      } else {
        const col = await comments()
        const result = await col.findOneAndUpdate(
          { _id: targetId as unknown as string },
          { $inc: { likesCount: -1 } },
          { returnDocument: "after" }
        )
        newCount = result?.likesCount ?? 0
      }

      respected = false
    } else {
      // --- Respect: insert a new like ---
      await likesCol.insertOne({
        _id: new ObjectId().toString(),
        userId,
        targetId,
        targetType,
        createdAt: new Date(),
      })

      // Increment likesCount on the target document
      if (targetType === "article") {
        const col = await articles()
        const result = await col.findOneAndUpdate(
          { _id: targetId as unknown as string },
          { $inc: { likesCount: 1 } },
          { returnDocument: "after" }
        )
        newCount = result?.likesCount ?? 1
      } else {
        const col = await comments()
        const result = await col.findOneAndUpdate(
          { _id: targetId as unknown as string },
          { $inc: { likesCount: 1 } },
          { returnDocument: "after" }
        )
        newCount = result?.likesCount ?? 1
      }

      // Add XP logic: +10 for author, +2 for user who liked
      const targetDoc = targetType === "article" 
        ? await (await articles()).findOne({ _id: targetId as any })
        : await (await comments()).findOne({ _id: targetId as any })

      if (targetDoc && targetDoc.authorId) {
        const usersCol = await users()
        // +10 XP to author
        if (targetDoc.authorId !== userId) {
          await usersCol.updateOne(
            { clerkId: targetDoc.authorId },
            { $inc: { xp: 10 } }
          )
        }
        // +2 XP to user who clicked respect
        await usersCol.updateOne(
          { clerkId: userId },
          { $inc: { xp: 2 } }
        )
      }

      respected = true
    }

    return NextResponse.json({ respected, newCount })
  } catch (error) {
    console.error("[POST /api/respect]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
