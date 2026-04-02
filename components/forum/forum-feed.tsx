"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { 
  MessageSquare, Send, Hash, Crown, Trash2, 
  Eye, TrendingUp, Lock, PenLine, Image as ImageIcon,
  Globe, ChevronDown
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { HoverProfileCard } from "@/components/feed/hover-profile-card"
import { getRankIcon, getRankBadgeStyles } from "@/components/ui/authority-badge"
import { RankBadge } from "@/components/ui/rank-badge"
import type { UserRole } from "@/lib/db/schema"
import { 
  createForumTopic, 
  adminDeleteForumTopic, 
  getForumTopics,
  getUserRespectStatus 
} from "@/lib/actions/forum-actions"
import { ForumRespectButton } from "./forum-respect-button"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import type { ForumTopic, ForumTopicType } from "@/lib/db/schema"

interface ForumTopicItem extends ForumTopic {
  author?: {
    name: string
    avatar?: string | null
    rank: UserRole | string
    respectPoints?: number
    clerkId?: string
    username?: string
    xp?: number
    bio?: string
  }
}

interface ForumFeedProps {
  initialTopics: ForumTopic[]
}

const CATEGORIES = [
  { id: "GENERAL", label: "General", color: "bg-zinc-800" },
  { id: "philosophy", label: "Philosophy", color: "bg-purple-900/50" },
  { id: "technology", label: "Technology", color: "bg-blue-900/50" },
  { id: "cinema", label: "Cinema", color: "bg-pink-900/50" },
  { id: "books", label: "Books", color: "bg-amber-900/50" },
  { id: "relationships", label: "Relationships", color: "bg-rose-900/50" },
  { id: "lifestyle", label: "Lifestyle", color: "bg-emerald-900/50" },
  { id: "finance", label: "Finance", color: "bg-green-900/50" },
]

export function ForumFeed({ initialTopics }: ForumFeedProps) {
  const { user, isSignedIn } = useUser()
  const router = useRouter()
  const isCaesar = user?.id === CAESAR_CLERK_ID
  const [topics, setTopics] = useState<ForumTopicItem[]>(initialTopics)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [userRespect, setUserRespect] = useState({
    canGive: false,
    daysRemaining: 0,
    respectPoints: 0,
    respectCapacity: 1
  })

  useEffect(() => {
    if (isSignedIn) {
      getUserRespectStatus().then(res => {
        if (res.success) {
          setUserRespect({
            canGive: res.canGiveRespect || false,
            daysRemaining: res.daysRemaining || 0,
            respectPoints: res.respectPoints || 0,
            respectCapacity: res.respectCapacity || 1
          })
        }
      })
    }
  }, [isSignedIn])

  const handleStartPublish = () => {
    if (title.trim().length >= 4) {
      router.push(`/forum/publish?title=${encodeURIComponent(title.trim())}`)
    }
  }

  const handleDelete = async (topicId: string) => {
    if (!isCaesar) return
    if (!confirm("Are you sure you want to purge this noise?")) return

    const res = await adminDeleteForumTopic(topicId)
    if (res.success) {
      setTopics(prev => prev.filter(t => t._id !== topicId))
      toast.success("Topic purged")
    } else {
      toast.error(res.error || "Failed to purge")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Title Input */}
      <div className="flex flex-col gap-4 bg-zinc-950/50 p-4 sm:p-6 rounded-2xl border border-zinc-800/50 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-purple-500/10">
            <PenLine className="h-5 w-5 text-purple-400" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Start a Discussion</h2>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="What's on your mind? (min. 4 characters)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartPublish()}
            className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all"
          />
          <Button
            onClick={handleStartPublish}
            disabled={title.trim().length < 4}
            className="rounded-xl bg-white hover:bg-zinc-200 text-black font-bold px-6 shadow-lg shadow-white/5 transition-all disabled:opacity-50 w-full sm:w-auto"
          >
            Publish
          </Button>
        </div>
      </div>

      {/* Topics Feed */}
      <div className="space-y-4">
        {topics.map((topic) => (
          <div 
            key={topic._id}
            className="group relative bg-black border border-zinc-900/50 rounded-2xl p-5 hover:bg-zinc-950 transition-all duration-300"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-3">
                <div className="flex items-center gap-3">
                  {topic.author ? (
                    <HoverProfileCard author={{
                      id: topic.author.id,
                      clerkId: topic.author.clerkId,
                      username: topic.author.username || 'user',
                      name: topic.author.name,
                      avatar: topic.author.avatar || null,
                      rank: topic.author.rank,
                      xp: topic.author.xp || 0,
                      respectPoints: topic.author.respectPoints,
                      bio: topic.author.bio
                    }}>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="relative h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                          {topic.author.avatar ? (
                            <img src={topic.author.avatar} alt={topic.author.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-zinc-600 uppercase">
                              {topic.author.name.charAt(0)}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 z-10">
                            <RankBadge role={topic.author.rank as any || "CITIZEN"} size="sm" />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white hover:text-purple-400 transition-colors">
                              {topic.author.name}
                            </span>
                            <RankBadge role={topic.author.rank as any || "CITIZEN"} size="sm" showLabel />
                          </div>
                          <span className="text-[10px] text-zinc-600">
                            @{topic.author.username || 'user'} · {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </HoverProfileCard>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden flex-shrink-0">
                        <div className="h-full w-full flex items-center justify-center text-xs font-bold text-zinc-600 uppercase">
                          {topic.authorName?.charAt(0)}
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">
                          {topic.authorName}
                        </span>
                        <span className="text-[10px] text-zinc-600">
                          {formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Link href={`/forum/topic/${topic._id}`} className="block group/title">
                  <h3 className="text-lg font-bold text-zinc-100 group-hover/title:text-purple-400 transition-colors leading-tight mb-1">
                    {topic.title}
                  </h3>
                  
                  {topic.imageUrl && (
                    <div className="my-3 rounded-xl overflow-hidden border border-zinc-900 h-48 sm:h-64">
                      <img src={topic.imageUrl} alt="" className="w-full h-full object-cover group-hover/title:scale-105 transition-transform duration-500" />
                    </div>
                  )}

                  <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed mb-3">
                    {topic.content}
                  </p>

                  {topic.tags && topic.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {topic.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-purple-400 transition-colors">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>

                <div className="flex items-center gap-6 pt-3 border-t border-zinc-900/50 mt-4">
                  <ForumRespectButton 
                    authorId={topic.authorId} 
                    initialRespects={topic.likesCount || 0} 
                  />
                  
                  <Link href={`/forum/topic/${topic._id}`} className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors">
                    <MessageSquare className="h-4 w-4" />
                    <span className="text-sm font-bold">{topic.repliesCount || 0} Replies</span>
                  </Link>
                  
                  <div className="flex items-center gap-1.5 text-zinc-600 ml-auto">
                    <Eye className="h-4 w-4" />
                    <span className="text-xs font-medium">{topic.views || 0} views</span>
                  </div>
                  
                  <div className="px-2 py-0.5 rounded-full bg-zinc-900/50 border border-zinc-800 text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                    {topic.category}
                  </div>
                </div>
              </div>

              {isCaesar && (
                <button
                  onClick={() => handleDelete(topic._id)}
                  className="p-2 rounded-lg bg-zinc-900/50 text-zinc-600 hover:text-red-400 hover:bg-red-950/20 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {topics.length === 0 && (
          <div className="text-center py-20 bg-zinc-950/20 rounded-2xl border border-zinc-900/50">
            <MessageSquare className="h-12 w-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">No discussions in the Arena yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
