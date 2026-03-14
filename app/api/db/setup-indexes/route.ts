import { NextResponse } from "next/server"
import { getDb } from "@/lib/db/mongodb"

/**
 * POST /api/db/setup-indexes
 *
 * Creates optimal MongoDB indexes for categories, search,
 * and common query patterns. Idempotent — safe to call multiple times.
 */
export async function POST() {
  try {
    const db = await getDb()

    // Articles indexes
    const articlesCol = db.collection("articles")
    await articlesCol.createIndex({ status: 1, publishedAt: -1 })
    await articlesCol.createIndex({ category: 1, publishedAt: -1 })
    await articlesCol.createIndex({ tags: 1 })
    await articlesCol.createIndex({ slug: 1 }, { unique: true })
    await articlesCol.createIndex({ authorId: 1, publishedAt: -1 })
    await articlesCol.createIndex({ isFeatured: 1, publishedAt: -1 })
    // Text index for full-text search
    await articlesCol.createIndex(
      { title: "text", tags: "text", excerpt: "text", content: "text" },
      {
        weights: { title: 10, tags: 5, excerpt: 3, content: 1 },
        name: "articles_text_search",
      }
    )

    // Users indexes
    const usersCol = db.collection("users")
    await usersCol.createIndex({ clerkId: 1 }, { unique: true, sparse: true })
    await usersCol.createIndex({ username: 1 }, { unique: true, sparse: true })
    await usersCol.createIndex({ email: 1 }, { unique: true, sparse: true })
    await usersCol.createIndex({ xp: -1 })
    await usersCol.createIndex({ rank: 1, xp: -1 })
    // Text index for profile search
    await usersCol.createIndex(
      { username: "text", displayName: "text", name: "text" },
      { name: "users_text_search" }
    )

    // Likes indexes
    const likesCol = db.collection("likes")
    await likesCol.createIndex({ userId: 1, targetId: 1 }, { unique: true })
    await likesCol.createIndex({ targetId: 1, targetType: 1 })

    // Comments indexes
    const commentsCol = db.collection("comments")
    await commentsCol.createIndex({ articleId: 1, createdAt: -1 })
    await commentsCol.createIndex({ parentId: 1, createdAt: 1 })
    await commentsCol.createIndex({ authorId: 1, createdAt: -1 })

    // Follows indexes
    const followsCol = db.collection("follows")
    await followsCol.createIndex({ followerId: 1, followingId: 1 }, { unique: true })
    await followsCol.createIndex({ followingId: 1 })

    // Activity logs indexes
    const activityCol = db.collection("activityLogs")
    await activityCol.createIndex({ userId: 1, createdAt: -1 })
    await activityCol.createIndex({ action: 1, createdAt: -1 })

    return NextResponse.json({ success: true, message: "All indexes created successfully" })
  } catch (error) {
    console.error("[POST /api/db/setup-indexes]", error)
    return NextResponse.json(
      { success: false, error: "Failed to create indexes" },
      { status: 500 }
    )
  }
}
