import { NextResponse } from "next/server"
import { getForumTopics } from "@/lib/actions/forum-actions"

export async function GET() {
  try {
    // Fetch top 5 trending forum topics
    const res = await getForumTopics(undefined, 5)
    
    if (res.success) {
      // Sort by views or replies count if available
      const sortedTopics = (res.topics as any[]).sort((a, b) => 
        (b.repliesCount || 0) + (b.views || 0) - ((a.repliesCount || 0) + (a.views || 0))
      )
      
      return NextResponse.json({ topics: sortedTopics })
    }
    
    return NextResponse.json({ topics: [] })
  } catch (error) {
    console.error("[GET /api/forum/trending]", error)
    return NextResponse.json({ topics: [] }, { status: 500 })
  }
}
