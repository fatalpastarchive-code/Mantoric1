import { NextRequest, NextResponse } from "next/server"
import { searchAll } from "@/lib/db/queries"

/**
 * GET /api/search?q=query&limit=10
 *
 * Hybrid search across articles (title, tags, content) and user profiles (username, displayName).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q") || ""
    const limit = Math.min(20, Math.max(1, Number(searchParams.get("limit") || "10")))

    if (!query.trim()) {
      return NextResponse.json({ articles: [], profiles: [] })
    }

    const results = await searchAll(query.trim(), limit)
    return NextResponse.json(results)
  } catch (error) {
    console.error("[GET /api/search]", error)
    return NextResponse.json(
      { articles: [], profiles: [], error: "Search failed" },
      { status: 500 },
    )
  }
}
