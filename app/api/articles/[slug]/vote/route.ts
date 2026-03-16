import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { articles } from "@/lib/db/collections"
import { ObjectId } from "mongodb"

// POST - Vote on an article (Like/Dislike)
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type } = await req.json() // "like" or "dislike"
    if (!type || !["like", "dislike"].includes(type)) {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 })
    }

    const articlesCol = await articles()
    const article = await articlesCol.findOne({ slug: params.slug })

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    // Check if user already voted
    const existingVote = article.votes?.find((v: any) => v.userId === userId)
    let update: any = {}

    if (existingVote) {
      if (existingVote.type === type) {
        // Remove vote (toggle off)
        update = {
          $pull: { votes: { userId } },
          $inc: { 
            likes: type === "like" ? -1 : 0,
            dislikes: type === "dislike" ? -1 : 0
          }
        }
      } else {
        // Change vote type
        update = {
          $set: { "votes.$.type": type },
          $inc: {
            likes: type === "like" ? 1 : -1,
            dislikes: type === "dislike" ? 1 : -1
          }
        }
      }
    } else {
      // New vote
      update = {
        $push: { votes: { userId, type, createdAt: new Date() } },
        $inc: {
          likes: type === "like" ? 1 : 0,
          dislikes: type === "dislike" ? 1 : 0
        }
      }
    }

    const result = await articlesCol.findOneAndUpdate(
      { slug: params.slug },
      update,
      { returnDocument: "after" }
    )

    return NextResponse.json({
      success: true,
      likes: result?.likes || 0,
      dislikes: result?.dislikes || 0,
      userVote: type === existingVote?.type ? null : type
    })
  } catch (error) {
    console.error("[POST /api/articles/vote] Error:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
