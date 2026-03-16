"use client"

import { useState, useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"
import { ArticleCard, type ArticleCardProps } from "./article-card"
import { Loader2 } from "lucide-react"

interface InfiniteFeedProps {
  initialArticles: ArticleCardProps[]
  category?: string
}

export function InfiniteFeed({ initialArticles, category }: InfiniteFeedProps) {
  const [articles, setArticles] = useState<ArticleCardProps[]>(initialArticles)
  const [skip, setSkip] = useState(initialArticles.length)
  const [hasMore, setHasMore] = useState(initialArticles.length >= 20)
  const [isLoading, setIsLoading] = useState(false)
  
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: "400px",
  })

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMore()
    }
  }, [inView, hasMore, isLoading])

  // Reset when category changes
  useEffect(() => {
    setArticles(initialArticles)
    setSkip(initialArticles.length)
    setHasMore(initialArticles.length >= 20)
  }, [initialArticles, category])

  const loadMore = async () => {
    if (isLoading) return
    setIsLoading(true)
    
    try {
      const url = new URL("/api/articles", window.location.origin)
      if (category) url.searchParams.set("category", category)
      url.searchParams.set("limit", "20")
      url.searchParams.set("skip", skip.toString())

      const res = await fetch(url.toString())
      if (res.ok) {
        const data = await res.json()
        const newArticles = data.articles || []
        
        if (newArticles.length === 0) {
          setHasMore(false)
        } else {
          setArticles(prev => {
             // De-duplicate just in case
             const existingIds = new Set(prev.map(a => a.id))
             const filtered = newArticles.filter((a: any) => !existingIds.has(a.id))
             return [...prev, ...filtered]
          })
          setSkip(prev => prev + newArticles.length)
          if (newArticles.length < 20) setHasMore(false)
        }
      }
    } catch (error) {
      console.error("Failed to load more articles", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-5">
        {articles.map((article) => (
          <ArticleCard key={article.id} {...article} />
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="flex flex-col items-center justify-center py-10">
          {isLoading && (
            <div className="flex items-center gap-3 rounded-full bg-secondary/50 px-4 py-2 border border-border/40 backdrop-blur-md">
               <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
               <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Loading Wisdom</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && articles.length > 0 && (
         <div className="flex items-center justify-center pt-8 pb-20 opacity-30 select-none">
            <span className="h-[1px] flex-1 bg-border" />
            <span className="px-4 text-xs font-black uppercase tracking-[0.3em]">End of Forum</span>
            <span className="h-[1px] flex-1 bg-border" />
         </div>
      )}
    </div>
  )
}
