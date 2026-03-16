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
  Type
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
import { CATEGORIES } from "@/lib/constants"

interface PublishFormProps {
  defaultAuthorName: string
}

export function PublishForm({ defaultAuthorName }: PublishFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const excerptMaxChars = 150
  
  const initialTitle = searchParams.get("title") || ""
  const initialCategory = searchParams.get("category") || ""

  const [title, setTitle] = useState(initialTitle)
  const [category, setCategory] = useState(initialCategory)
  const [tags, setTags] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [view, setView] = useState<"edit" | "preview">("edit")

  const excerptChars = excerpt.length
  const excerptRemaining = Math.max(0, excerptMaxChars - excerptChars)

  // Toolbar actions
  const insertText = (before: string, after: string = "") => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const newText = content.substring(0, start) + before + (selectedText || "text") + after + content.substring(end)
    setContent(newText)
    
    // Reset focus and selection
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
    if (!title.trim() || !category.trim() || !content.trim()) {
      toast.error("Title, category and content are required.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          excerpt: excerpt.trim() || undefined,
          content: content.trim(),
          category: category.trim(),
          coverImage: coverImage.trim(),
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        toast.error(data?.error || "Failed to publish article.")
        return
      }

      toast.success("Article published successfully.")

      if (data?.slug) {
        router.push(`/article/${data.slug}`)
      } else {
        router.push("/")
      }
    } catch (error) {
      console.error("Failed to publish article", error)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 rounded-xl border border-border/50 bg-card/40 p-6 backdrop-blur-md">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Article Title</Label>
              <Input
                id="title"
                placeholder="The Philosophy of Leadership..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 border-border/50 bg-background/50 text-lg font-bold placeholder:font-normal focus:ring-emerald-500/20"
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category" className="h-11 border-border/50 bg-background/50">
                    <SelectValue placeholder="Select a domain" />
                  </SelectTrigger>
                  <SelectContent className="border-border/50 bg-card">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.label} className="focus:bg-emerald-500/10 focus:text-emerald-400">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="coverImage" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Cover Image URL (optional)</Label>
                <Input
                  id="coverImage"
                  placeholder="https://..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="h-11 border-border/50 bg-background/50"
                />
              </div>
          <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="excerpt" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Short Description (Summary)</Label>
                  <span className="text-xs text-muted-foreground">{excerptRemaining} characters</span>
                </div>
                <textarea
                  id="excerpt"
                  rows={2}
                  value={excerpt}
                  onChange={(e) => {
                    const next = e.target.value
                    if (next.length <= excerptMaxChars) {
                      setExcerpt(next)
                      return
                    }
                    setExcerpt(next.slice(0, excerptMaxChars))
                  }}
                  placeholder="A short summary to be displayed under the title on home and profile pages (max 150 characters)"
                  className="w-full resize-none rounded-lg border border-border/50 bg-background/30 p-3 text-sm leading-relaxed outline-none transition-all focus:border-emerald-500/30 focus:bg-background/50"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="tags" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Knowledge Tags (optional)</Label>
                <Input
                  id="tags"
                  placeholder="stoicism, leadership, growth"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="h-11 border-border/50 bg-background/50"
                />
              </div>
            </div>
          </div>

          {/* Editor Section */}
          <Tabs value={view} onValueChange={(v) => setView(v as "edit" | "preview")} className="w-full">
            <div className="flex items-center justify-between border-b border-border/30 pb-2">
              <TabsList className="bg-secondary/50">
                <TabsTrigger value="edit" className="data-[state=active]:bg-background">
                  <Edit3 className="mr-2 h-3.5 w-3.5" />
                  Write
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-background">
                  <Eye className="mr-2 h-3.5 w-3.5" />
                  Preview
                </TabsTrigger>
              </TabsList>

              {view === "edit" && (
                <div className="flex items-center gap-1 overflow-hidden rounded-lg border border-border/30 bg-background/50 p-1">
                  <Button variant="ghost" size="sm" onClick={() => insertText("**", "**")} type="button" className="h-8 w-8 p-0">
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertText("## ", "")} type="button" className="h-8 w-8 p-0">
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => insertText("### ", "")} type="button" className="h-8 w-8 p-0">
                    <Heading3 className="h-4 w-4" />
                  </Button>
                  <div className="mx-1 h-4 w-[1px] bg-border/50" />
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
                  rows={20}
                  placeholder="Begin your treatise..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full resize-none rounded-lg border border-border/50 bg-background/30 p-5 font-mono text-sm leading-relaxed outline-none transition-all focus:border-emerald-500/30 focus:bg-background/50"
                  required
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-0 min-h-[500px]">
                <div className="rounded-lg border border-border/30 bg-background/20 p-8 shadow-inner">
                  <article className="prose-mantoric max-w-none">
                    {title && (
                      <h1 className="mb-8 text-4xl font-bold tracking-tight text-foreground">
                        {title}
                      </h1>
                    )}
                    {content.trim() ? (
                      <ReactMarkdown>{content}</ReactMarkdown>
                    ) : (
                      <div className="flex h-[300px] flex-col items-center justify-center gap-3 text-muted-foreground">
                        <Type className="h-10 w-10 opacity-20" />
                        <p className="text-sm">Knowledge will manifest here once you begin writing.</p>
                      </div>
                    )}
                  </article>
                </div>
              </TabsContent>
            </div>
          </Tabs>

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col text-xs text-muted-foreground">
              <span className="font-semibold text-foreground/70">Authoring as {defaultAuthorName}</span>
              <span className="mt-1">Images can be inserted via URL and will be beautifully framed.</span>
            </div>
            <Button 
              type="submit" 
              disabled={isSubmitting || !title.trim() || !category || !content.trim()}
              className="h-11 rounded-full bg-foreground px-8 font-bold text-background transition-all hover:scale-105 hover:bg-foreground/90 disabled:opacity-50"
            >
              {isSubmitting ? "Synthesizing..." : "Publish Article"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

