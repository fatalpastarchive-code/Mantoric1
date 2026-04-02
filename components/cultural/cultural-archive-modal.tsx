"use client"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BookOpen, Film, Search, Star, Loader2, X, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { searchCulturalContent, type UnifiedCulturalResult } from "@/lib/actions/cultural-actions"
import { createCulturalReview } from "@/lib/actions/cultural-review-actions"
import { getBrotherhoodStatus } from "@/lib/actions/support-intent-actions"
import { toast } from "sonner"
import type { CulturalType } from "@/lib/db/schema"
import { ShieldAlert } from "lucide-react"
import { useEffect } from "react"

interface CulturalArchiveModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function CulturalArchiveModal({ open, onOpenChange, onSuccess }: CulturalArchiveModalProps) {
  const [activeTab, setActiveTab] = useState<CulturalType>("BOOK")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UnifiedCulturalResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedItem, setSelectedItem] = useState<UnifiedCulturalResult | null>(null)
  
  // Form state
  const [quote, setQuote] = useState("")
  const [review, setReview] = useState("")
  const [rating, setRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isBanned, setIsBanned] = useState(false)

  useEffect(() => {
    async function checkBan() {
      const { isPostBanned } = await getBrotherhoodStatus()
      setIsBanned(isPostBanned)
    }
    if (open) checkBan()
  }, [open])

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const results = await searchCulturalContent(searchQuery, activeTab)
      setSearchResults(results)
    } catch (error) {
      toast.error("Search failed")
    } finally {
      setIsSearching(false)
    }
  }, [searchQuery, activeTab])

  const handleSelectItem = (item: UnifiedCulturalResult) => {
    setSelectedItem(item)
    setSearchResults([])
    setSearchQuery("")
  }

  const handleSubmit = async () => {
    if (!selectedItem) return
    if (!review.trim()) {
      toast.error("Please enter a review")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await createCulturalReview({
        type: selectedItem.type,
        externalId: selectedItem.externalId,
        title: selectedItem.title,
        imageUrl: selectedItem.imageUrl,
        quote: quote.trim() || undefined,
        review: review.trim(),
        rating,
      })

      if (result.success) {
        toast.success("Added to Cultural Archive")
        onSuccess?.()
        handleClose()
      } else {
        toast.error(result.error || "Failed to save")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSearchQuery("")
    setSearchResults([])
    setSelectedItem(null)
    setQuote("")
    setReview("")
    setRating(5)
    onOpenChange(false)
  }

  const handleTabChange = (value: string) => {
    if (value) {
      setActiveTab(value as CulturalType)
      setSearchResults([])
      setSearchQuery("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-black border-none p-0 overflow-hidden">
        <div className="bg-black text-white">
          {/* Header with Watermark */}
          <DialogHeader className="p-6 pb-4 relative">
            <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
              <span className="text-6xl font-serif italic">M</span>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight">
              Cultural Archive
            </DialogTitle>
            <p className="text-sm text-zinc-500 mt-1">
              Document your cultural journey
            </p>
          </DialogHeader>

          <div className="p-6 pt-2 space-y-6">
            {/* Type Toggle */}
            {!selectedItem && (
              <ToggleGroup
                type="single"
                value={activeTab}
                onValueChange={handleTabChange}
                className="w-full justify-start gap-2"
              >
                <ToggleGroupItem
                  value="BOOK"
                  aria-label="Books"
                  className={cn(
                    "px-4 py-2 rounded-full border border-zinc-800 data-[state=on]:border-purple-500 data-[state=on]:bg-purple-500/10 data-[state=on]:text-purple-400",
                    "text-zinc-500 hover:text-zinc-300 transition-all"
                  )}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Books
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="MOVIE"
                  aria-label="Cinema"
                  className={cn(
                    "px-4 py-2 rounded-full border border-zinc-800 data-[state=on]:border-purple-500 data-[state=on]:bg-purple-500/10 data-[state=on]:text-purple-400",
                    "text-zinc-500 hover:text-zinc-300 transition-all"
                  )}
                >
                  <Film className="h-4 w-4 mr-2" />
                  Cinema
                </ToggleGroupItem>
              </ToggleGroup>
            )}

            {/* Search Section */}
            {!selectedItem && (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={`Search ${activeTab === "BOOK" ? "books" : "movies & series"}...`}
                    className="pl-10 bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-purple-500/50"
                  />
                  <Button
                    size="sm"
                    onClick={handleSearch}
                    disabled={isSearching || !searchQuery.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    {isSearching ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Search className="h-3 w-3" />
                    )}
                  </Button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    {searchResults.map((item) => (
                      <button
                        key={item.externalId}
                        onClick={() => handleSelectItem(item)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/50 hover:border-zinc-700 transition-all text-left group"
                      >
                        <div className="h-12 w-8 rounded overflow-hidden bg-zinc-900 shrink-0">
                          {item.imageUrl && item.imageUrl !== "/M.jpg" ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-zinc-700" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate group-hover:text-white">
                            {item.title}
                          </p>
                          {item.year && (
                            <p className="text-xs text-zinc-600">{item.year}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Selected Item & Form */}
            {selectedItem && (
              <div className="space-y-5">
                {/* Selected Item Header */}
                <div className="flex items-start gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
                  <div className="h-20 w-14 rounded overflow-hidden bg-zinc-900 shrink-0">
                    {selectedItem.imageUrl && selectedItem.imageUrl !== "/M.jpg" ? (
                      <img
                        src={selectedItem.imageUrl}
                        alt={selectedItem.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-zinc-700" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{selectedItem.title}</h3>
                    {selectedItem.year && (
                      <p className="text-sm text-zinc-500">{selectedItem.year}</p>
                    )}
                    <p className="text-xs text-zinc-600 mt-1 uppercase tracking-wider">
                      {selectedItem.type}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-1 hover:bg-zinc-800 rounded transition-colors"
                  >
                    <X className="h-4 w-4 text-zinc-500" />
                  </button>
                </div>

                {/* Rating */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Rating (1-10)</label>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setRating(i + 1)}
                        className="p-0.5 transition-all"
                      >
                        <Star
                          className={cn(
                            "h-5 w-5",
                            i < rating
                              ? "fill-purple-500 text-purple-500"
                              : "text-zinc-700"
                          )}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm font-medium text-purple-400">
                      {rating}/10
                    </span>
                  </div>
                </div>

                {/* Axiom Quote */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">
                    Axiom Quote <span className="text-zinc-600">(Optional)</span>
                  </label>
                  <Input
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="A memorable line that resonates..."
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 focus:border-purple-500/50 italic"
                  />
                </div>

                {/* Review Analysis */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-400">Review Analysis</label>
                  <Textarea
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    placeholder="Your analytical perspective..."
                    rows={4}
                    className="bg-zinc-950 border-zinc-800 text-white placeholder:text-zinc-700 focus:border-purple-500/50 resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 pt-0 flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900"
            >
              Cancel
            </Button>
            {selectedItem && (
              isBanned ? (
                <div className="flex items-center gap-2 px-6 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">
                  <ShieldAlert className="h-4 w-4" />
                  Your voice has been silenced by the Senate.
                </div>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !review.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Archive Entry"
                  )}
                </Button>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
