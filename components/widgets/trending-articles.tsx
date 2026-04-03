"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingUp, Flame, Eye, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface TrendingArticle {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  views: number
  likes: number
  author: {
    username: string
    displayName: string
  }
}

interface TrendingArticlesWidgetProps {
  category?: string
  limit?: number
}

export function TrendingArticlesWidget({ category, limit = 3 }: TrendingArticlesWidgetProps) {
  const [articles, setArticles] = useState<TrendingArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const url = new URL("/api/articles/trending", window.location.origin)
        if (category) url.searchParams.set("category", category)
        url.searchParams.set("limit", limit.toString())
        
        const res = await fetch(url.toString())
        if (res.ok) {
          const data = await res.json()
          setArticles(data.articles || [])
        }
      } catch (error) {
        console.error("Failed to fetch trending articles:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [category, limit])

  // Get category color
  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      "philosophy": "bg-purple-500/20 text-purple-400",
      "finance": "bg-emerald-500/20 text-emerald-400",
      "self-improvement": "bg-amber-500/20 text-amber-400",
      "fitness": "bg-red-500/20 text-red-400",
      "relationships": "bg-pink-500/20 text-pink-400",
      "technology": "bg-blue-500/20 text-blue-400",
      "lifestyle": "bg-cyan-500/20 text-cyan-400",
    }
    return colors[cat.toLowerCase()] || "bg-primary/20 text-primary"
  }

  // Get category color for number bubbles
  const getNumberColor = (index: number) => {
    const colors = ["bg-orange-600/30 text-orange-400", "bg-zinc-800 text-zinc-400", "bg-amber-800/40 text-amber-500"]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] bg-card p-4 backdrop-blur-md border border-border/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-5 w-5 rounded-full bg-zinc-800 animate-pulse" />
          <div className="h-4 w-32 bg-zinc-800 animate-pulse rounded" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3">
              <div className="h-5 w-5 rounded-full bg-white/5 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2.5 bg-white/5 rounded-lg w-1/3" />
                <div className="h-3.5 bg-white/5 rounded-lg w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-[2rem] bg-card p-4 backdrop-blur-md border border-border/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-1 rounded-full bg-orange-500/10">
            <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500/20" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">You Must Know</span>
        </div>
        <p className="text-xs text-zinc-500 text-center py-4 font-medium italic">
          No trending articles yet
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-card p-4 backdrop-blur-md border border-border/30 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-1 rounded-full bg-orange-500/10">
          <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500/30" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500">You Must Know</span>
      </div>

      <div className="space-y-3">
        {articles.map((article, index) => (
          <Link 
            key={article.id} 
            href={`/article/${article.slug}`}
            className="group flex gap-3 items-start transition-all duration-300"
          >
            <div className={cn(
              "h-5 w-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black",
              getNumberColor(index)
            )}>
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider truncate">
                  {article.category}
                </span>
              </div>
              <h4 className="text-[13px] font-bold text-foreground line-clamp-1 leading-tight group-hover:text-orange-400 transition-colors">
                {article.title}
              </h4>
              <div className="mt-1 flex items-center gap-2.5 text-[10px] text-zinc-500 font-medium">
                <span className="flex items-center gap-1 opacity-70">
                  <Eye className="h-3 w-3" /> {article.views}
                </span>
                <span className="flex items-center gap-1 text-orange-500/80">
                  <Flame className="h-3 w-3 fill-current" /> {article.likes}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link 
        href="/trending" 
        className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between group"
      >
        <span className="text-[12px] font-bold text-zinc-500 group-hover:text-white transition-colors tracking-tight">
          View All
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </Link>
    </div>
  )
}
