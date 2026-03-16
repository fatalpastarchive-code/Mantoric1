import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { users } from "@/lib/db/collections"

// DELETE - Remove media item
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string; mediaId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { userId: targetUserId, mediaId } = await params
    if (userId !== targetUserId) {
      return NextResponse.json({ error: "Can only modify own profile" }, { status: 403 })
    }

    const usersCol = await users()

    // Try to remove from readBooks first
    const bookResult = await usersCol.updateOne(
      { clerkId: userId },
      { $pull: { readBooks: { id: mediaId } } }
    )

    // If not found in books, try watchedMedia
    if (bookResult.modifiedCount === 0) {
      await usersCol.updateOne(
        { clerkId: userId },
        { $pull: { watchedMedia: { id: mediaId } } }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DELETE /api/user/[userId]/media/[mediaId]]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
