import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { articles } from "@/lib/db/collections"
import { ObjectId } from "mongodb"

// GET /api/articles/[slug]/quiz
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
    
    const quiz = article.quiz || null
    return NextResponse.json({ quiz })
  } catch (error) {
    console.error("[GET /api/articles/[slug]/quiz]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
