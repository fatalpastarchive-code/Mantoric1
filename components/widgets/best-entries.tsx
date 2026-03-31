"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MessageSquare, TrendingUp, ArrowUpRight, Eye, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface BestEntry {
  _id: string
  title: string
  repliesCount: number
  views?: number
  likesCount?: number
  category: string
}

export function BestEntriesWidget() {
  const [entries, setEntries] = useState<BestEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBestEntries = async () => {
      try {
        const res = await fetch("/api/forum/trending")
        if (res.ok) {
          const data = await res.json()
          setEntries(data.topics || [])
        }
      } catch (error) {
        console.error("Failed to fetch best entries:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBestEntries()
  }, [])

  if (loading) {
    return (
      <div className="rounded-3xl bg-zinc-950/50 p-6 border border-zinc-900/50 backdrop-blur-sm">
        <div className="h-5 w-32 bg-zinc-900 animate-pulse rounded mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse space-y-2">
              <div className="h-4 bg-zinc-900 rounded w-full" />
              <div className="h-3 bg-zinc-900 rounded w-1/4" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl bg-zinc-950/50 p-6 border border-zinc-900/50 backdrop-blur-sm shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-black uppercase tracking-widest text-white">Best Entries</h3>
        </div>
      </div>

      <div className="space-y-5">
        {entries.map((entry, index) => (
          <Link 
            key={entry._id} 
            href={`/forum/topic/${entry._id}`}
            className="group block space-y-1.5"
          >
            <div className="flex items-start gap-3">
              <span className="text-xs font-black text-zinc-700 mt-0.5">0{index + 1}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-zinc-200 group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                  {entry.title}
                </h4>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex items-center gap-1 text-zinc-500">
                    <Eye className="h-3 w-3" />
                    <span className="text-[10px] font-bold">{entry.views || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-500">
                    <Heart className="h-3 w-3" />
                    <span className="text-[10px] font-bold">{entry.likesCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-zinc-500">
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-[10px] font-bold">{entry.repliesCount || 0}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-600 font-bold">
                    {entry.category}
                  </span>
                </div>
              </div>
              <ArrowUpRight className="h-3 w-3 text-zinc-800 group-hover:text-purple-400 transition-colors opacity-0 group-hover:opacity-100" />
            </div>
          </Link>
        ))}

        {entries.length === 0 && (
          <p className="text-xs text-zinc-600 italic text-center py-4">
            No trending discussions yet.
          </p>
        )}
      </div>

      <Link 
        href="/forum" 
        className="mt-6 flex items-center justify-center w-full py-2.5 rounded-xl bg-zinc-900/50 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
      >
        View All Arena
      </Link>
    </div>
  )
}
