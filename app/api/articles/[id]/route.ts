import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { articles } from "@/lib/db/collections"
import { resolveMantoricRole } from "@/lib/auth/roles"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { ObjectId } from "mongodb"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = await resolveMantoricRole(user as any)

    const isCaesarById = userId === CAESAR_CLERK_ID
    const isSenatorByRole = role === "Senator"

    if (!isCaesarById && !isSenatorByRole) {
      return NextResponse.json(
        { error: "Forbidden. Only Caesar or Senators can delete articles." },
        { status: 403 },
      )
    }

    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 })
    }

    const col = await articles()

    // We try catching both ObjectId and string ID formats since slugs are currently used as _id sometimes
    let result
    try {
      result = await col.deleteOne({ _id: new ObjectId(id) as any })
    } catch {
      // Fallback to string deletion
      result = await col.deleteOne({ _id: id as any })
    }

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Article securely deleted." })
  } catch (error) {
    console.error("[DELETE /api/articles/[id]]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
