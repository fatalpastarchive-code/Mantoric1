"use client"

import { useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"
import { 
  Bold, 
  Heading2, 
  Heading3, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Eye, 
  Edit3,
  MessageSquare
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createForumTopic } from "@/lib/actions/forum-actions"

const FORUM_CATEGORIES = [
  { id: "GENERAL", label: "General" },
  { id: "philosophy", label: "Philosophy" },
  { id: "technology", label: "Technology" },
  { id: "cinema", label: "Cinema" },
  { id: "books", label: "Books" },
  { id: "relationships", label: "Relationships" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "finance", label: "Finance" },
]

export function ForumPublishForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  const initialTitle = searchParams.get("title") || ""
  const sourceId = searchParams.get("sourceId")
  const sourceType = searchParams.get("type")

  const [title, setTitle] = useState(initialTitle)
  const [category, setCategory] = useState("GENERAL")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [view, setView] = useState<"edit" | "preview">("edit")

  // Toolbar actions
  const insertText = (before: string, after: string = "") => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + (selectedText || "text") + after + content.substring(end)
    setContent(newText)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + (selectedText.length || 4))
    }, 0)
  }

  const handleInsertImage = () => {
    const url = prompt("Enter image URL:")
    if (url) {
      insertText(`\n![Image Description](${url})\n`, "")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || title.trim().length < 4) {
      toast.error("Title must be at least 4 characters.")
      return
    }
    if (!content.trim()) {
      toast.error("Content is required.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createForumTopic({
        title: title.trim(),
        content: content.trim(),
        category: category.toLowerCase(),
        type: "GENERAL",
        relatedArticleId: sourceType === "article" ? sourceId : undefined,
        relatedCultureId: sourceType === "cultural" || sourceType === "culture" ? sourceId : undefined
      })

      if (!res.success) {
        toast.error(res.error || "Failed to start discussion.")
        return
      }

      toast.success("Discussion started!")
      if (res.topic?._id) {
        router.push(`/forum/topic/${res.topic._id}`)
      } else {
        router.push("/forum")
      }
    } catch (error) {
      console.error("Failed to create topic", error)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 rounded-xl border border-zinc-800/50 bg-black p-6 shadow-2xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-zinc-500">Discussion Title</Label>
              <Input
                id="title"
                placeholder="What's on your mind?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 border-zinc-800 bg-zinc-900/50 text-lg font-bold placeholder:font-normal focus:ring-purple-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-bold uppercase tracking-wider text-zinc-500">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category" className="h-11 border-zinc-800 bg-zinc-900/50">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="border-zinc-800 bg-zinc-950">
                  {FORUM_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id} className="focus:bg-purple-500/10 focus:text-purple-400">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={view} onValueChange={(v) => setView(v as "edit" | "preview")} className="w-full">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <TabsList className="bg-zinc-900">
                <TabsTrigger value="edit" className="data-[state=active]:bg-zinc-800">
                  <Edit3 className="mr-2 h-3.5 w-3.5" />
                  Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-zinc-800">
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Preview
                </TabsTrigger>
              </TabsList>

              {view === "edit" && (
                <div className="flex items-center gap-1 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50 p-1">
                  <Button variant="ghost" size="sm" onClick={() => insertText("**", "**")} type="button" className="h-8 w-8 p-0">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertText("## ", "")} type="button" className="h-8 w-8 p-0">
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertText("### ", "")} type="button" className="h-8 w-8 p-0">
                    <Heading3 className="h-4 w-4" />
                  </Button>
                  <div className="mx-1 h-4 w-[1px] bg-zinc-800" />
                  <Button variant="ghost" size="sm" onClick={handleInsertImage} type="button" className="h-8 w-8 p-0">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertText("[", "](url)")} type="button" className="h-8 w-8 p-0">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <TabsContent value="edit" className="mt-0">
                <textarea
                  ref={textareaRef}
                  id="content"
                  rows={15}
                  placeholder="Share your thoughts with the Arena..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/20 p-5 font-mono text-sm leading-relaxed outline-none transition-all focus:border-purple-500/30 focus:bg-zinc-900/40"
                  required
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-0">
                <div className="min-h-[300px] rounded-lg border border-zinc-800 bg-zinc-900/10 p-5">
                  {content ? (
                    <article className="prose prose-invert prose-purple max-w-none">
                      <ReactMarkdown>{content}</ReactMarkdown>
                    </article>
                  ) : (
                    <p className="text-zinc-500 italic text-center py-20">Nothing to preview yet</p>
                  )}
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex items-center justify-between gap-4 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || title.length < 4 || !content.trim()}
              className="rounded-full bg-purple-600 px-8 font-bold text-white hover:bg-purple-500 shadow-lg shadow-purple-500/20"
            >
              {isSubmitting ? "Publishing..." : "Publish to Arena"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
