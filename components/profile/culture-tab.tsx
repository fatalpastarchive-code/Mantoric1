"use client"

import { useState } from "react"
import { BookOpen, Film, Tv, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { CultureCard } from "@/components/cultural/culture-card"

interface MediaItem {
  id: string
  type: "book" | "movie" | "series"
  title: string
  rating: number
  review: string
  addedAt: Date
  imageUrl: string
  quote?: string
}

interface CultureTabProps {
  userId: string
  isOwnProfile: boolean
  initialMedia?: MediaItem[]
}

export function CultureTab({ userId, isOwnProfile, initialMedia = [] }: CultureTabProps) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia)

  const handleDelete = (id: string) => {
    // The actual deletion is handled by CultureCard's server action
    // We just need to update the UI state here
    setMedia(prev => prev.filter(m => m.id !== id))
  }

  const books = media.filter(m => m.type === "book")
  const movies = media.filter(m => m.type === "movie")
  const series = media.filter(m => m.type === "series")

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-center">
          <BookOpen className="h-5 w-5 text-amber-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-foreground">{books.length}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Books</p>
        </div>
        <div className="p-4 rounded-2xl bg-pink-500/5 border border-pink-500/10 text-center">
          <Film className="h-5 w-5 text-pink-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-foreground">{movies.length}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Movies</p>
        </div>
        <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/10 text-center">
          <Tv className="h-5 w-5 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-black text-foreground">{series.length}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Series</p>
        </div>
      </div>

      {/* Add Button - Redirects to /culture as requested */}
      {isOwnProfile && (
        <Button
          asChild
          className="w-full rounded-xl bg-white hover:bg-zinc-200 text-black border-none py-6 font-bold shadow-lg transition-all"
        >
          <a href="/culture">
            <Plus className="h-5 w-5 mr-2" />
            Add to Your Culture Collection
          </a>
        </Button>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {media.map(item => (
          <CultureCard
            key={item.id}
            review={{
              _id: item.id,
              userId: userId,
              type: item.type.toUpperCase() as any,
              title: item.title,
              rating: item.rating,
              review: item.review,
              imageUrl: item.imageUrl,
              quote: item.quote,
              createdAt: item.addedAt
            }}
            isOwnProfile={isOwnProfile}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
      </div>

      {media.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-secondary/20 border border-border/30">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No culture items added yet</p>
          {isOwnProfile && (
            <p className="text-sm text-muted-foreground/60 mt-1">
              Share what you're reading and watching
            </p>
          )}
        </div>
      )}
    </div>
  )
}
