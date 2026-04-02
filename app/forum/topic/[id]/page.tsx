import { Suspense } from "react"
import { notFound } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { getForumTopic, getForumComments } from "@/lib/actions/forum-actions"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { MessageSquare, ArrowLeft, Clock, Eye, Share2, MoreHorizontal, Zap, ShieldCheck } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"
import { ForumRespectButton } from "@/components/forum/forum-respect-button"
import { ForumCommentForm } from "@/components/forum/forum-comment-form"

interface TopicPageProps {
  params: Promise<{ id: string }>
}

export default async function ForumTopicPage({ params }: TopicPageProps) {
  const { id } = await params
  const { userId } = await auth()
  
  const [topicRes, commentsRes] = await Promise.all([
    getForumTopic(id),
    getForumComments(id)
  ])

  if (!topicRes.success || !topicRes.topic) {
    notFound()
  }

  const topic = topicRes.topic
  const comments = commentsRes.success ? commentsRes.comments : []

  const mainContent = (
    <div className="flex flex-col gap-6">
      {/* Navigation & Topic Header */}
      <div className="space-y-4">
        <Link 
          href="/forum" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors group"
        >
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
          Back to Arena
        </Link>

        <div className="bg-zinc-950/50 border border-zinc-900/50 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-10 w-10 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
              {topic.author?.avatar ? (
                <img src={topic.author.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-sm font-bold text-zinc-600 uppercase">
                  {topic.authorName?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{topic.authorName}</span>
                {topic.author?.rank && (
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                    {topic.author.rank}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
                </div>
                <span>•</span>
                <div className="flex items-center gap-1 uppercase tracking-wider font-bold text-purple-400/80">
                  {topic.category}
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-6">
            {topic.title}
          </h1>

          {topic.imageUrl && (
            <div className="mb-6 rounded-2xl overflow-hidden border border-zinc-900 max-h-96">
              <img src={topic.imageUrl} alt={topic.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-invert prose-purple max-w-none mb-8">
            <ReactMarkdown>{topic.content}</ReactMarkdown>
          </div>

          {/* Tags */}
          {topic.tags && topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {topic.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] uppercase tracking-widest font-bold text-zinc-500 hover:text-purple-400 transition-colors">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Interlinking Source Link if exists */}
          {(topic.relatedArticleId || topic.relatedCultureId) && (
            <div className="mb-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-between group hover:bg-amber-500/10 transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Zap className="h-4 w-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60">Source Material</p>
                  <p className="text-sm font-bold text-zinc-200">This discussion is linked to an archive entry</p>
                </div>
              </div>
              <Link 
                href={topic.relatedArticleId ? `/articles/${topic.relatedArticleId}` : `/culture`}
                className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black text-xs font-black uppercase tracking-widest transition-all"
              >
                Go to Source
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-zinc-900">
            <div className="flex items-center gap-4">
              <ForumRespectButton 
                authorId={topic.authorId} 
                initialRespects={topic.author?.respectPoints || 0} 
              />
              <div className="h-4 w-[1px] bg-zinc-800" />
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-zinc-400">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm font-bold">{topic.repliesCount || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm font-bold">{topic.views || 0}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl text-zinc-500 hover:text-white">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-xl text-zinc-500 hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Replies Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-black uppercase tracking-widest text-white px-2">Replies ({comments.length})</h3>
        
        {/* Comment Form */}
        {userId && <ForumCommentForm topicId={id} />}

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment: any) => (
            <div key={comment._id} className="bg-zinc-950/30 border border-zinc-900/50 rounded-3xl p-6 hover:bg-zinc-900/40 transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <div className="h-full w-full flex items-center justify-center text-xs font-bold text-zinc-600 uppercase">
                    {comment.authorName?.charAt(0)}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{comment.authorName}</span>
                  <span className="text-[10px] text-zinc-600">
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed pl-1">
                {comment.content}
              </p>
            </div>
          ))}

          {comments.length === 0 && (
            <div className="bg-zinc-950/30 border border-zinc-900/50 rounded-3xl p-12 text-center">
              <MessageSquare className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-500 font-medium">Be the first to share your perspective in this archive entry.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar activeCategory="forum" />}
      mainContent={mainContent}
      rightSidebar={<RightSidebar showBestEntries={true} />}
    />
  )
}
