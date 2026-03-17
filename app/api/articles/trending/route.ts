import { NextRequest, NextResponse } from "next/server"
import { articles, users } from "@/lib/db/collections"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const limit = parseInt(searchParams.get("limit") || "5")

    const articlesCol = await articles()
    
    // Build query
    const query: Record<string, unknown> = { status: "published" }
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, "i") }
    }

    // Get trending articles (sorted by likes and published within last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const trendingArticles = await articlesCol
      .find({
        ...query,
        publishedAt: { $gte: sevenDaysAgo }
      })
      .sort({ likesCount: -1, views: -1 })
      .limit(limit)
      .toArray()

    // Fallback to all-time if no recent articles
    let finalArticles = trendingArticles
    if (trendingArticles.length < limit) {
      const remainingLimit = limit - trendingArticles.length
      const excludeIds = trendingArticles.map(a => a._id)
      const fallbackArticles = await articlesCol
        .find({
          ...query,
          _id: { $nin: excludeIds }
        })
        .sort({ likesCount: -1, views: -1 })
        .limit(remainingLimit)
        .toArray()
      finalArticles = [...trendingArticles, ...fallbackArticles]
    }

    // Enrich with author info
    const authorIds = [...new Set(finalArticles.map(a => a.authorId).filter(Boolean))]
    const usersCol = await users()
    const authorDocs = await usersCol
      .find({ $or: [{ _id: { $in: authorIds as any[] } }, { clerkId: { $in: authorIds } }] })
      .toArray()

    const userById = new Map()
    for (const u of authorDocs) {
      if (u._id) userById.set(String(u._id), u)
      if (u.clerkId) userById.set(u.clerkId, u)
    }

    const enrichedArticles = finalArticles.map(a => {
      const u = userById.get(a.authorId)
      return {
        id: String(a._id),
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt || "",
        category: a.category,
        views: a.views || 0,
        likes: a.likesCount || 0,
        author: {
          username: u?.username || "unknown",
          displayName: u?.displayName || u?.name || "Unknown",
        }
      }
    })

    return NextResponse.json({ articles: enrichedArticles })
  } catch (error) {
    console.error("Error fetching trending articles:", error)
    return NextResponse.json({ articles: [] }, { status: 500 })
  }
}
