import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { users } from "@/lib/db/collections"

// GET - Fetch user's media collection
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId: targetUserId } = await params
    
    const usersCol = await users()
    const user = await usersCol.findOne({ 
      $or: [{ clerkId: targetUserId }, { _id: targetUserId }] 
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    // Combine readBooks and watchedMedia from schema
    const media = [
      ...(user.readBooks || []).map((b: any) => ({ ...b, type: "book" })),
      ...(user.watchedMedia || []).map((m: any) => ({ 
        ...m, 
        type: m.type === "movie" ? "movie" : "series" 
      }))
    ].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    
    return NextResponse.json({ media })
  } catch (error) {
    console.error("[GET /api/user/[userId]/media]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST - Add new media item
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId: targetUserId } = await params
    if (userId !== targetUserId) {
      return NextResponse.json({ error: "Can only modify own profile" }, { status: 403 })
    }

    const body = await req.json()
    const { type, title, rating, review } = body

    if (!type || !title || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const usersCol = await users()
    const newItem = {
      id: crypto.randomUUID(),
      title,
      rating,
      review: review || "",
      addedAt: new Date(),
      type: type === "book" ? "book" : type
    }

    if (type === "book") {
      await usersCol.updateOne(
        { clerkId: userId },
        { $push: { readBooks: newItem } }
      )
    } else {
      await usersCol.updateOne(
        { clerkId: userId },
        { $push: { watchedMedia: { ...newItem, type } } }
      )
    }

    return NextResponse.json({ 
      item: { ...newItem, type },
      success: true 
    })
  } catch (error) {
    console.error("[POST /api/user/[userId]/media]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
