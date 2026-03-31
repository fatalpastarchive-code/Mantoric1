"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  MessageSquare, ArrowLeft, Send, Hash, Shield, BookOpen, Film
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { createForumTopic } from "@/lib/actions/forum-actions"
import type { ForumTopicType } from "@/lib/db/schema"
import { articles } from "@/lib/db/collections"

export function CreateForumTopicPage() {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const sourceId = searchParams.get("sourceId")
  const sourceType = searchParams.get("type") as "article" | "culture" | null
  
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("GENERAL")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sourceData, setSourceData] = useState<{
    title: string
    imageUrl?: string
    excerpt?: string
  } | null>(null)

  // Load source data if cross-posting
  useEffect(() => {
    if (sourceId && sourceType) {
      loadSourceData()
    }
  }, [sourceId, sourceType])

  const loadSourceData = async () => {
    try {
      if (sourceType === "article") {
        // Fetch article data
        const res = await fetch(`/api/articles/${sourceId}`)
        if (res.ok) {
          const article = await res.json()
          setSourceData({
            title: article.title,
            imageUrl: article.imageUrl,
            excerpt: article.excerpt
          })
          setTitle(`Discussion: ${article.title}`)
          setCategory(article.category || "GENERAL")
        }
      }
      // Could add culture type here for movies/books
    } catch (error) {
      console.error("Failed to load source data:", error)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content required")
      return
    }
    if (!isSignedIn) {
      toast.error("Sign in to post")
      return
    }

    setIsSubmitting(true)
    const res = await createForumTopic({
      title: title.trim(),
      content: content.trim(),
      category,
      type: (sourceType === "article" ? "ARTICLE_REF" : sourceType === "culture" ? "CULTURE_REF" : "GENERAL") as ForumTopicType,
      relatedArticleId: sourceType === "article" ? sourceId : undefined,
      relatedCultureId: sourceType === "culture" ? sourceId : undefined
    })
    setIsSubmitting(false)

    if (res.success) {
      toast.success("Discussion created")
      router.push(`/forum/topic/${res.topic?._id}`)
    } else {
      toast.error(res.error || "Failed to create discussion")
    }
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">Sign in to start a discussion</p>
          <Link href="/sign-in" className="text-purple-400 hover:text-purple-300 mt-2 inline-block">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[900px] mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-900/50 px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/forum"
              className="p-2 rounded-xl hover:bg-zinc-900 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Start Discussion</h1>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  {sourceType ? "Neural Interlink" : "New Topic"}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Source Card (if cross-posting) */}
          {sourceData && (
            <div className="mb-6 p-4 bg-zinc-950 rounded-2xl border border-zinc-800/50">
              <div className="flex items-center gap-2 mb-3">
                {sourceType === "article" ? (
                  <BookOpen className="h-4 w-4 text-violet-400" />
                ) : (
                  <Film className="h-4 w-4 text-emerald-400" />
                )}
                <span className="text-xs text-zinc-500 uppercase tracking-wider">
                  Source: {sourceType === "article" ? "Article" : "Culture Entry"}
                </span>
              </div>
              <div className="flex gap-4">
                {sourceData.imageUrl && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                    <img 
                      src={sourceData.imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    {sourceData.title}
                  </h3>
                  {sourceData.excerpt && (
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {sourceData.excerpt}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-800/50">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                  Title
                </label>
                <Input
                  placeholder="Title your discourse..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-purple-500/30"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-medium transition-all",
                        category === cat.id
                          ? "bg-purple-600/20 text-purple-400 border border-purple-600/30"
                          : "bg-zinc-900 text-zinc-500 hover:text-zinc-300"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                  Content
                </label>
                <Textarea
                  placeholder="What wisdom do you bring to the Arena?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] bg-zinc-950 border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 resize-none focus-visible:ring-purple-500/30"
                />
                <p className="text-xs text-zinc-600 mt-2">
                  Supports Markdown formatting
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-900/50">
                <Link 
                  href="/forum"
                  className="text-sm text-zinc-500 hover:text-zinc-300"
                >
                  Cancel
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-600">
                    {content.length} chars
                  </span>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !title.trim() || !content.trim()}
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-6"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                        Creating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Post to Arena
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

const CATEGORIES = [
  { id: "GENERAL", label: "General" },
  { id: "philosophy", label: "Philosophy" },
  { id: "technology", label: "Technology" },
  { id: "cinema", label: "Cinema" },
  { id: "books", label: "Books" },
  { id: "relationships", label: "Relationships" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "finance", label: "Finance & Career" },
]
