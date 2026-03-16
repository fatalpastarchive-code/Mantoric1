import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { articles } from "@/lib/db/collections"
import { ObjectId } from "mongodb"

// GET /api/articles/[slug]/comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const col = await articles()
    
    let article
    try {
      article = await col.findOne({ _id: new ObjectId(slug) })
    } catch {
      article = await col.findOne({ _id: slug, slug: slug })
    }
    
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }
    
    const comments = article.comments || []
    return NextResponse.json({ comments })
  } catch (error) {
    console.error("[GET /api/articles/[slug]/comments]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// POST /api/articles/[slug]/comments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { slug } = await params
    const { content } = await request.json()
    
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const col = await articles()
    
    let article
    try {
      article = await col.findOne({ _id: new ObjectId(slug) })
    } catch {
      article = await col.findOne({ _id: slug, slug: slug })
    }
    
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    const newComment = {
      id: new ObjectId().toString(),
      content: content.trim(),
      createdAt: new Date().toISOString(),
      author: {
        userId,
        name: "Anonymous",
        avatar: null
      }
    }

    await col.updateOne(
      { _id: article._id },
      { $push: { comments: newComment } }
    )

    return NextResponse.json({ comment: newComment })
  } catch (error) {
    console.error("[POST /api/articles/[slug]/comments]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
