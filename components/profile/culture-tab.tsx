"use client"

import { useState } from "react"
import { BookOpen, Film, Tv, Star, Plus, X, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface MediaItem {
  id: string
  type: "book" | "movie" | "series"
  title: string
  rating: number
  review?: string
  addedAt: Date
}

interface CultureTabProps {
  userId: string
  isOwnProfile: boolean
  initialMedia?: MediaItem[]
}

export function CultureTab({ userId, isOwnProfile, initialMedia = [] }: CultureTabProps) {
  const [media, setMedia] = useState<MediaItem[]>(initialMedia)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<"book" | "movie" | "series">("book")
  const [newItem, setNewItem] = useState({ title: "", rating: 0, review: "" })

  const handleAddMedia = async () => {
    if (!newItem.title.trim() || newItem.rating === 0) {
      toast.error("Please enter a title and rating")
      return
    }

    try {
      const res = await fetch(`/api/user/${userId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          title: newItem.title,
          rating: newItem.rating,
          review: newItem.review,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setMedia(prev => [data.item, ...prev])
        setNewItem({ title: "", rating: 0, review: "" })
        setIsAddDialogOpen(false)
        toast.success("Added to your culture collection!")
      }
    } catch (error) {
      toast.error("Failed to add media")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/user/${userId}/media/${id}`, { method: "DELETE" })
      if (res.ok) {
        setMedia(prev => prev.filter(m => m.id !== id))
        toast.success("Removed from collection")
      }
    } catch (error) {
      toast.error("Failed to remove")
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "book": return <BookOpen className="h-4 w-4" />
      case "movie": return <Film className="h-4 w-4" />
      case "series": return <Tv className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "book": return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "movie": return "bg-pink-500/10 text-pink-400 border-pink-500/20"
      case "series": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      default: return "bg-secondary text-muted-foreground"
    }
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

      {/* Add Button */}
      {isOwnProfile && (
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          className="w-full rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 py-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add to Your Culture Collection
        </Button>
      )}

      {/* Books Section */}
      {books.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <BookOpen className="h-4 w-4 text-amber-400" />
            Books Read
          </h3>
          <div className="space-y-3">
            {books.map(item => (
              <MediaCard
                key={item.id}
                item={item}
                isOwnProfile={isOwnProfile}
                onDelete={() => handleDelete(item.id)}
                typeColor={getTypeColor(item.type)}
                typeIcon={getTypeIcon(item.type)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Movies Section */}
      {movies.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Film className="h-4 w-4 text-pink-400" />
            Movies Watched
          </h3>
          <div className="space-y-3">
            {movies.map(item => (
              <MediaCard
                key={item.id}
                item={item}
                isOwnProfile={isOwnProfile}
                onDelete={() => handleDelete(item.id)}
                typeColor={getTypeColor(item.type)}
                typeIcon={getTypeIcon(item.type)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Series Section */}
      {series.length > 0 && (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">
            <Tv className="h-4 w-4 text-purple-400" />
            Series Completed
          </h3>
          <div className="space-y-3">
            {series.map(item => (
              <MediaCard
                key={item.id}
                item={item}
                isOwnProfile={isOwnProfile}
                onDelete={() => handleDelete(item.id)}
                typeColor={getTypeColor(item.type)}
                typeIcon={getTypeIcon(item.type)}
              />
            ))}
          </div>
        </div>
      )}

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

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add to Collection</DialogTitle>
            <DialogDescription>Share what you're consuming</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Type Selector */}
            <div className="flex gap-2">
              {(["book", "movie", "series"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={cn(
                    "flex-1 py-2 px-3 rounded-xl border text-sm font-medium capitalize transition-all",
                    selectedType === type
                      ? getTypeColor(type)
                      : "bg-secondary/50 border-border/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {type === "series" ? "TV Series" : type}
                </button>
              ))}
            </div>

            {/* Title Input */}
            <input
              type="text"
              value={newItem.title}
              onChange={e => setNewItem({ ...newItem, title: e.target.value })}
              placeholder={`${selectedType === "series" ? "TV Series" : selectedType} title...`}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary focus:outline-none"
            />

            {/* Rating */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setNewItem({ ...newItem, rating: star })}
                    className="p-1"
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-all",
                        newItem.rating >= star
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground/30"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Review */}
            <textarea
              value={newItem.review}
              onChange={e => setNewItem({ ...newItem, review: e.target.value })}
              placeholder="Brief thoughts (optional)..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border/50 focus:border-primary focus:outline-none resize-none"
            />

            <Button onClick={handleAddMedia} className="w-full">
              Add to Collection
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Media Card Component
interface MediaCardProps {
  item: MediaItem
  isOwnProfile: boolean
  onDelete: () => void
  typeColor: string
  typeIcon: React.ReactNode
}

function MediaCard({ item, isOwnProfile, onDelete, typeColor, typeIcon }: MediaCardProps) {
  return (
    <div className="group p-4 rounded-xl bg-secondary/20 border border-border/30 hover:border-border/50 transition-all">
      <div className="flex items-start gap-3">
        <div className={cn("p-2 rounded-lg shrink-0", typeColor)}>
          {typeIcon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-foreground truncate">{item.title}</h4>
            {isOwnProfile && (
              <button
                onClick={onDelete}
                className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={cn(
                  "h-3 w-3",
                  item.rating >= star
                    ? "fill-yellow-500 text-yellow-500"
                    : "text-muted-foreground/20"
                )}
              />
            ))}
            <span className="ml-2 text-xs text-muted-foreground">
              {new Date(item.addedAt).toLocaleDateString()}
            </span>
          </div>
          {item.review && (
            <p className="mt-2 text-sm text-muted-foreground italic">"{item.review}"</p>
          )}
        </div>
      </div>
    </div>
  )
}
