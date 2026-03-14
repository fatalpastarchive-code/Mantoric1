import { NextRequest, NextResponse } from "next/server"
import { articles, users } from "@/lib/db/collections"
import type { Article, User } from "@/lib/db/schema"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const requestedLimit = Number(searchParams.get("limit") || "8")
    const size = Math.min(10, Math.max(6, isNaN(requestedLimit) ? 8 : requestedLimit))

    const col = await articles()
    const docs = (await col
      .aggregate<Article>([
        { $match: { status: "published" } },
        { $sample: { size } },
      ])
      .toArray()) as Article[]

    if (!docs.length) {
      return NextResponse.json({ articles: [] })
    }

    const authorIds = Array.from(new Set(docs.map((a) => a.authorId).filter(Boolean)))

    const usersCol = await users()
    const authorUsers = (await usersCol
      .find<User>({
        $or: [{ _id: { $in: authorIds as any[] } }, { clerkId: { $in: authorIds } }],
      })
      .toArray()) as User[]

    const userById = new Map<string, User>()
    for (const u of authorUsers) {
      if (u._id) userById.set(u._id, u)
      if (u.clerkId) userById.set(u.clerkId, u)
    }

    const result = docs.map((a) => {
      const u = userById.get(a.authorId)

      return {
        id: a._id,
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt,
        imageUrl: a.imageUrl,
        category: a.category,
        createdAt: a.createdAt,
        readTime: a.readTime,
        likes: a.likesCount,
        comments: a.commentsCount,
        viewCount: a.views,
        author: {
          name: a.authorName || u?.displayName || u?.name || "Unknown",
          avatar: u?.avatar || u?.image,
          bannerUrl: u?.bannerUrl,
          bio: u?.bio,
          rank: u?.rank || "Newbie",
          xp: u?.xp ?? 0,
        },
      }
    })

    return NextResponse.json({ articles: result })
  } catch (error) {
    console.error("[GET /api/articles/random]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}

