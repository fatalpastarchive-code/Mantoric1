/**
 * Reusable database query helpers for the Mantoric platform.
 * All queries return plain serializable objects (no Mongo ObjectId, Date etc.)
 * ready for server component rendering.
 */
import { articles, users } from "./collections"
import type { Article, User } from "./schema"
import { clerkClient } from "@clerk/nextjs/server"

export interface EnrichedArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  imageUrl: string
  category: string
  tags: string[]
  createdAt: string
  readTime: number
  likes: number
  comments: number
  views: number
  author: {
    clerkId?: string
    username?: string
    name: string
    avatar?: string
    bannerUrl?: string
    bio?: string
    rank: string
    xp: number
  }
}

/**
 * Fetch published articles with optional category filter.
 * Returns enriched articles with author info resolved.
 */
export async function fetchArticles(opts?: {
  category?: string
  limit?: number
  skip?: number
}): Promise<EnrichedArticle[]> {
  const { category, limit = 20, skip = 0 } = opts || {}

  const col = await articles()

  const filter: Record<string, unknown> = { status: "published" }
  if (category) {
    // Case-insensitive regex match to handle slight variations
    filter.category = { $regex: new RegExp(`^${escapeRegex(category)}$`, "i") }
  }

  const docs = await col
    .find(filter)
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()

  if (!docs.length) return []

  // Resolve authors
  const authorIds = [...new Set(docs.map((d) => d.authorId).filter(Boolean))]
  const usersCol = await users()
  const authorDocs = await usersCol
    .find({
      $or: [
        { _id: { $in: authorIds as any[] } },
        { clerkId: { $in: authorIds } },
      ],
    })
    .toArray()

  const userById = new Map<string, User>()
  const clerkIdsToFetch = new Set<string>()

  for (const u of authorDocs) {
    if (u._id) userById.set(String(u._id), u)
    if (u.clerkId) {
      userById.set(u.clerkId, u)
      clerkIdsToFetch.add(u.clerkId)
    }
  }

  // Fetch fresh avatars directly from Clerk to ensure they are up to date
  const clerkAvatars = new Map<string, string>()
  if (clerkIdsToFetch.size > 0) {
    try {
      const client = await clerkClient()
      const clerkUsers = await client.users.getUserList({
        userId: Array.from(clerkIdsToFetch),
      })
      clerkUsers.data.forEach((cu) => {
        if (cu.imageUrl) clerkAvatars.set(cu.id, cu.imageUrl)
      })
    } catch (e) {
      console.warn("MANTORIC: Failed to sync clerk avatars in fetchArticles", e)
    }
  }

  return docs.map((a) => {
    const u = userById.get(a.authorId)
    return {
      id: String(a._id),
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt || "",
      imageUrl: a.imageUrl || "",
      category: a.category,
      tags: a.tags || [],
      createdAt:
        a.publishedAt?.toISOString?.() ??
        a.createdAt?.toISOString?.() ??
        new Date().toISOString(),
      readTime: a.readTime || 1,
      likes: a.likesCount ?? 0,
      comments: a.commentsCount ?? 0,
      views: a.views ?? 0,
      author: {
        clerkId: u?.clerkId || a.authorId,
        username: u?.username,
        name: a.authorName || u?.displayName || u?.name || "Unknown",
        avatar: clerkAvatars.get(u?.clerkId as string) || clerkAvatars.get(a.authorId) || u?.avatar || u?.image || undefined,
        bannerUrl: u?.bannerUrl || undefined,
        bio: u?.bio || undefined,
        rank: u?.rank || "Newbie",
        xp: u?.xp ?? 0,
      },
    }
  })
}

/**
 * Search articles and users by query string.
 */
export async function searchAll(query: string, limit = 10) {
  const col = await articles()
  const usersCol = await users()

  // Try text search first; fall back to regex if no text index
  let articleResults: Article[] = []
  let userResults: User[] = []
  const regex = new RegExp(escapeRegex(query), "i")

  try {
    articleResults = await col
      .find({
        status: "published",
        $or: [
          { title: regex },
          { tags: regex },
          { excerpt: regex },
          { content: regex },
        ],
      })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .toArray()
  } catch {
    articleResults = []
  }

  try {
    userResults = await usersCol
      .find({
        $or: [
          { username: regex },
          { displayName: regex },
          { name: regex },
        ],
      })
      .limit(limit)
      .toArray()
  } catch {
    userResults = []
  }

  return {
    articles: articleResults.map((a) => ({
      id: String(a._id),
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt || "",
      category: a.category,
      imageUrl: a.imageUrl || "",
    })),
    profiles: userResults.map((u) => ({
      id: String(u._id),
      username: u.username || u.name || "unknown",
      displayName: u.displayName || u.name || "Unknown",
      avatar: u.avatar || u.image || "",
      rank: u.rank || "Newbie",
      xp: u.xp ?? 0,
    })),
  }
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
