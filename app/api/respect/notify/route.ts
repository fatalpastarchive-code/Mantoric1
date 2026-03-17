import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { respects } from "@/lib/db/collections"

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ notifications: [] })

    const respectsCol = await respects()
    // Find respects given to this user in the last 30 seconds
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000)
    
    const newRespects = await respectsCol
      .find({
        targetUserId: userId,
        createdAt: { $gte: thirtySecondsAgo }
      })
      .toArray()

    return NextResponse.json({ notifications: newRespects })
  } catch (error) {
    return NextResponse.json({ notifications: [] }, { status: 500 })
  }
}
