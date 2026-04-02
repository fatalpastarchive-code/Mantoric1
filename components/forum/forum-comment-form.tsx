"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MessageSquare, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createForumComment } from "@/lib/actions/forum-actions"

interface ForumCommentFormProps {
  topicId: string
}

export function ForumCommentForm({ topicId }: ForumCommentFormProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      const res = await createForumComment({
        topicId,
        content: content.trim()
      })

      if (res.success) {
        setContent("")
        toast.success("Perspective shared in the Arena.")
        router.refresh()
      } else {
        toast.error(res.error || "Failed to post comment")
      }
    } catch (error) {
      console.error("Failed to post comment", error)
      toast.error("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-zinc-950/50 border border-zinc-900 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <MessageSquare className="h-5 w-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4 px-1">Add to the Archive</h3>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your perspective with the community..."
              className="w-full min-h-[120px] bg-zinc-900/30 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all resize-none text-sm leading-relaxed"
              required
            />
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
          <Button 
            type="submit" 
            disabled={isSubmitting || !content.trim()}
            className="rounded-full bg-purple-600 px-8 font-bold text-white hover:bg-purple-500 shadow-lg shadow-purple-900/20 group"
          >
            {isSubmitting ? "Sharing..." : "Post Reply"}
            <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </form>
    </div>
  )
}
