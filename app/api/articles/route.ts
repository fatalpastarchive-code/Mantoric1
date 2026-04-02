import { NextRequest, NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { articles } from "@/lib/db/collections"
import { resolveMantoricRole } from "@/lib/auth/roles"
import { fetchArticles } from "@/lib/db/queries"
import type { Article } from "@/lib/db/schema"

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = await resolveMantoricRole(user as any)

    // ONLY users with 'LEGATE', 'SENATOR', or 'CAESAR' rank can publish culture articles
    if (role !== "CAESAR" && role !== "SENATOR" && role !== "LEGATE") {
      return NextResponse.json({ error: "Unauthorized. Required rank: Legate or above." }, { status: 403 })
    }

    const body = await req.json().catch(() => null)

    const { title, excerpt, content, category, tags, coverImage } = (body || {}) as {
      title?: string
      excerpt?: string
      content?: string
      category?: string
      tags?: string[]
      coverImage?: string
    }

    if (!title || !content || !category) {
      return NextResponse.json(
        { error: "title, content and category are required" },
        { status: 400 },
      )
    }

    const now = new Date()
    const baseSlug = slugify(title)
    const uniqueSlug = `${baseSlug}-${now.getTime().toString(36)}`

    const col = await articles()

    const finalExcerpt =
      typeof excerpt === "string" && excerpt.trim()
        ? excerpt.trim().slice(0, 150)
        : content
            .replace(/!\[.*?\]\(.*?\)/g, "")
            .replace(/\n/g, " ")
            .trim()
            .slice(0, 150)

    const doc: Article = {
      _id: uniqueSlug,
      slug: uniqueSlug,
      title,
      excerpt: finalExcerpt,
      content,
      imageUrl: coverImage || "",
      coverImage: coverImage || "",
      authorId: user.id,
      authorName: user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "Unknown",
      category,
      tags: Array.isArray(tags) ? tags : [],
      views: 0,
      likesCount: 0,
      commentsCount: 0,
      readTime: Math.max(1, Math.round(content.split(/\s+/).length / 200)),
      averageRating: 0,
      ratingsCount: 0,
      status: "published",
      isFeatured: false,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    }

    await col.insertOne(doc as any)

    return NextResponse.json(
      {
        id: doc._id,
        slug: doc.slug,
        title: doc.title,
        content: doc.content,
        authorId: doc.authorId,
        authorName: doc.authorName,
        category: doc.category,
        tags: doc.tags,
        createdAt: doc.createdAt,
        viewCount: doc.views,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[POST /api/articles]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}

/**
 * GET /api/articles
 *
 * Fetch published articles with optional category filter.
 * All data comes from MongoDB — no mock data.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") || undefined
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || "20")))
    const skip = Math.max(0, Number(searchParams.get("skip") || "0"))

    const enriched = await fetchArticles({ category, limit, skip })

    return NextResponse.json({ articles: enriched })
  } catch (error) {
    console.error("[GET /api/articles]", error)
    return NextResponse.json(
      { error: "Internal Server Error", articles: [] },
      { status: 500 },
    )
  }
}
