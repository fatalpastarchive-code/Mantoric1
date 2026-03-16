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

  if (loading) {
    return (
      <div className="rounded-2xl bg-secondary/30 p-4 border border-border/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground">You Must Know</span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-2 bg-border/50 rounded w-1/3 mb-2" />
              <div className="h-4 bg-border/50 rounded w-full mb-1" />
              <div className="h-3 bg-border/50 rounded w-2/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="rounded-2xl bg-secondary/30 p-4 border border-border/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground">You Must Know</span>
        </div>
        <p className="text-sm text-muted-foreground text-center py-4">
          No trending articles yet in {category || "this category"}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/30 p-4 border border-border/20 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20">
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <span className="text-[13px] font-bold uppercase tracking-wider text-muted-foreground">You Must Know</span>
        </div>
        {category && (
          <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-bold uppercase", getCategoryColor(category))}>
            {category}
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {articles.map((article, index) => (
          <Link 
            key={article.id} 
            href={`/article/${article.slug}`}
            className="group block"
          >
            <div className="flex items-start gap-3">
              <span className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                index === 0 ? "bg-orange-500/20 text-orange-500" :
                index === 1 ? "bg-zinc-500/20 text-zinc-400" :
                index === 2 ? "bg-amber-700/20 text-amber-600" :
                "bg-border/50 text-muted-foreground"
              )}>
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-1">
                  {article.category}
                </p>
                <h4 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {article.title}
                </h4>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {article.views.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="h-3 w-3 text-orange-500" />
                    {article.likes.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link 
        href={category ? `/category/${category.toLowerCase().replace(/\s+/g, '-')}` : "/trending"}
        className="mt-4 pt-3 border-t border-border/20 flex items-center justify-between group"
      >
        <span className="text-[11px] font-bold text-primary/80 group-hover:text-primary transition-colors">
          View All Trending
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-primary/60 group-hover:text-primary transition-colors" />
      </Link>
    </div>
  )
}
