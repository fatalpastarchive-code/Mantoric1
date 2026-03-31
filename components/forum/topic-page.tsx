"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  MessageSquare, ArrowLeft, Crown, Trash2, Send, 
  Eye, Clock, Hash, Shield, MoreHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { 
  getForumTopic, 
  getForumComments, 
  createForumComment, 
  deleteForumComment,
  adminDeleteForumTopic 
} from "@/lib/actions/forum-actions"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import type { ForumTopic, ForumComment } from "@/lib/db/schema"
import ReactMarkdown from "react-markdown"

interface TopicPageProps {
  params: { topicId: string }
}

export function TopicPage({ params }: TopicPageProps) {
  const { user, isSignedIn } = useUser()
  const isCaesar = user?.id === CAESAR_CLERK_ID
  const router = useRouter()
  const [topic, setTopic] = useState<ForumTopic | null>(null)
  const [comments, setComments] = useState<ForumComment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [params.topicId])

  const loadData = async () => {
    setLoading(true)
    const [topicRes, commentsRes] = await Promise.all([
      getForumTopic(params.topicId),
      getForumComments(params.topicId)
    ])
    
    if (topicRes.success) {
      setTopic(topicRes.topic as ForumTopic)
    } else {
      toast.error("Topic not found")
      router.push("/forum")
    }
    
    if (commentsRes.success) {
      setComments(commentsRes.comments as ForumComment[])
    }
    setLoading(false)
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    if (!isSignedIn) {
      toast.error("Sign in to comment")
      return
    }

    setIsSubmitting(true)
    const res = await createForumComment({
      topicId: params.topicId,
      content: newComment.trim()
    })
    setIsSubmitting(false)

    if (res.success) {
      toast.success("Comment posted")
      setNewComment("")
      loadData()
    } else {
      toast.error(res.error || "Failed to post comment")
    }
  }

  const handleDeleteTopic = async () => {
    if (!isCaesar) return
    
    const res = await adminDeleteForumTopic(params.topicId)
    if (res.success) {
      toast.success("Topic purged")
      router.push("/forum")
    } else {
      toast.error(res.error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    const res = await deleteForumComment(commentId, params.topicId)
    if (res.success) {
      toast.success("Comment purged")
      loadData()
    } else {
      toast.error(res.error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900" />
          <div className="h-4 w-32 bg-zinc-900 rounded" />
        </div>
      </div>
    )
  }

  if (!topic) return null

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-900/50 px-6 py-4">
          <div className="flex items-center justify-between">
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
                  <h1 className="text-lg font-bold text-white">The Arena</h1>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Discussion</p>
                </div>
              </div>
            </div>

            {isCaesar && (
              <Button
                onClick={handleDeleteTopic}
                variant="ghost"
                className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                size="sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Purge Topic
              </Button>
            )}
          </div>
        </header>

        <div className="flex">
          {/* Main Content */}
          <main className="flex-1 min-w-0 border-r border-zinc-900/50">
            {/* Topic */}
            <article className="p-6 border-b border-zinc-900/50">
              {/* Source Tag */}
              {topic.type !== "GENERAL" && (
                <div className="mb-4">
                  <span className={cn(
                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium",
                    topic.type === "ARTICLE_REF" 
                      ? "bg-violet-500/10 text-violet-400 border border-violet-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  )}>
                    <Hash className="h-3 w-3" />
                    {topic.type === "ARTICLE_REF" ? "Article Discussion" : "Culture Discussion"}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-2xl font-bold text-white mb-4 leading-tight">
                {topic.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-4 text-sm text-zinc-500 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center text-xs text-zinc-400">
                    {(topic.authorName || "A").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-zinc-300">{topic.authorName || "Anonymous"}</span>
                </div>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDistanceToNow(topic.createdAt, { addSuffix: true })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {topic.views} views
                </span>
              </div>

              {/* Content */}
              <div className="prose prose-invert prose-zinc max-w-none">
                <ReactMarkdown>{topic.content}</ReactMarkdown>
              </div>

              {/* Category */}
              <div className="mt-6 pt-6 border-t border-zinc-900/50">
                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">
                  {topic.category}
                </span>
              </div>
            </article>

            {/* Comments Section */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-400" />
                  Comments
                  <span className="text-sm text-zinc-500">({comments.length})</span>
                </h2>
              </div>

              {/* New Comment */}
              {isSignedIn ? (
                <div className="mb-8">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-sm text-zinc-400 shrink-0">
                      {(user?.fullName || "U").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <Textarea
                        placeholder="Share your thoughts..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="bg-zinc-950 border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 min-h-[100px] resize-none mb-3"
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSubmitComment}
                          disabled={isSubmitting || !newComment.trim()}
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                          size="sm"
                        >
                          {isSubmitting ? (
                            <span className="flex items-center gap-2">
                              <span className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full" />
                              Posting...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <Send className="h-3 w-3" />
                              Post Comment
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-4 bg-zinc-950 rounded-xl border border-zinc-900/50 text-center">
                  <p className="text-zinc-500 text-sm">Sign in to join the discussion</p>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
                    <p className="text-zinc-500">No comments yet</p>
                    <p className="text-xs text-zinc-600 mt-1">Be the first to share your thoughts</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <CommentCard
                      key={comment._id}
                      comment={comment}
                      isCaesar={isCaesar}
                      isAuthor={comment.authorId === user?.id}
                      onDelete={() => handleDeleteComment(comment._id)}
                    />
                  ))
                )}
              </div>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block w-[300px] p-6">
            <div className="sticky top-24 space-y-6">
              {/* About Arena */}
              <div className="bg-zinc-950/50 rounded-2xl p-5 border border-zinc-900/50">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-400" />
                  The Arena
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  A space for intellectual discourse and meaningful debate. 
                  Respect is earned, not given.
                </p>
              </div>

              {/* Stats */}
              <div className="bg-zinc-950/50 rounded-2xl p-5 border border-zinc-900/50">
                <h3 className="text-sm font-bold text-white mb-4">Topic Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Views</span>
                    <span className="text-sm text-white font-medium">{topic.views}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Comments</span>
                    <span className="text-sm text-white font-medium">{comments.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Likes</span>
                    <span className="text-sm text-white font-medium">{topic.likesCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

function CommentCard({ 
  comment, 
  isCaesar, 
  isAuthor, 
  onDelete 
}: { 
  comment: ForumComment
  isCaesar: boolean
  isAuthor: boolean
  onDelete: () => void
}) {
  const canDelete = isCaesar || isAuthor

  return (
    <div className="flex gap-4 group">
      <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-sm text-zinc-400 shrink-0">
        {(comment.authorName || "A").charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-white">
            {comment.authorName || "Anonymous"}
          </span>
          <span className="text-xs text-zinc-500">
            {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
          </span>
          {comment.isEdited && (
            <span className="text-[10px] text-zinc-600">(edited)</span>
          )}
        </div>
        <div className="text-sm text-zinc-300 leading-relaxed">
          {comment.content}
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-4 mt-2">
          {canDelete && (
            <button
              onClick={onDelete}
              className="text-xs text-zinc-600 hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
