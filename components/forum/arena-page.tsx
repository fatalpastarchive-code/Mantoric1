"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  MessageSquare, Send, Hash, Crown, Trash2, Shield, 
  Search, Flame, Eye, TrendingUp, Zap, Lock, PenLine,
  BookOpen, Film, Brain, Cpu, Heart, Coffee, Landmark,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { 
  createForumTopic, 
  adminDeleteForumTopic, 
  getForumTopics, 
  getTopAuthorities,
  getUserRespectStatus 
} from "@/lib/actions/forum-actions"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import type { ForumTopic, ForumTopicType } from "@/lib/db/schema"

interface ForumTopicItem extends ForumTopic {
  author?: {
    id: string
    name: string
    avatar?: string | null
    rank: string
    respectPoints?: number
  }
}

interface Authority {
  _id: string
  clerkId: string
  displayName?: string
  username?: string
  avatar?: string
  respectPoints: number
  rank: string
  role: string
}

export function ArenaPage() {
  const { user, isSignedIn } = useUser()
  const isCaesar = user?.id === CAESAR_CLERK_ID
  const [topics, setTopics] = useState<ForumTopicItem[]>([])
  const [authorities, setAuthorities] = useState<Authority[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [userRespect, setUserRespect] = useState({
    canGive: false,
    daysRemaining: 0,
    respectPoints: 0,
    respectCapacity: 1
  })

  useEffect(() => {
    loadData()
  }, [selectedCategory])

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

  const loadData = async () => {
    setLoading(true)
    const [topicsRes, authRes] = await Promise.all([
      getForumTopics(selectedCategory === "all" ? undefined : selectedCategory),
      getTopAuthorities(5)
    ])
    if (topicsRes.success) setTopics(topicsRes.topics as ForumTopicItem[])
    if (authRes.success) setAuthorities(authRes.authorities as Authority[])
    setLoading(false)
  }

  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-[1600px] mx-auto flex">
        <LeftColumn 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          isSignedIn={isSignedIn}
        />
        <MiddleColumn 
          topics={filteredTopics}
          loading={loading}
          userRespect={userRespect}
          isSignedIn={isSignedIn}
          isCaesar={isCaesar}
          onTopicCreated={loadData}
        />
        <RightColumn 
          authorities={authorities}
          userRespect={userRespect}
          isSignedIn={isSignedIn}
        />
      </div>
    </div>
  )
}

function LeftColumn({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, isSignedIn }: any) {
  return (
    <aside className="hidden lg:block w-[280px] min-h-screen sticky top-0 border-r border-zinc-900/50">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">The Arena</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Intellectual Combat</p>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
          <Input
            placeholder="Search discussions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-950 border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus-visible:ring-purple-500/30"
          />
        </div>

        <nav className="space-y-1">
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-2">Categories</p>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                selectedCategory === cat.id ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <cat.icon className={cn("h-4 w-4", cat.color)} />
              {cat.label}
            </button>
          ))}
        </nav>

        {isSignedIn && (
          <div className="mt-8 pt-6 border-t border-zinc-900/50">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest px-3 mb-3">My Debates</p>
            <Link href="/forum/my-topics" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm">
              <PenLine className="h-4 w-4" />
              Active Discussions
              <ChevronRight className="h-3 w-3 ml-auto" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  )
}

function MiddleColumn({ topics, loading, userRespect, isSignedIn, isCaesar, onTopicCreated }: any) {
  return (
    <main className="flex-1 min-w-0">
      <StartDiscussionBox userRespect={userRespect} isSignedIn={isSignedIn} onTopicCreated={onTopicCreated} />
      <div className="divide-y divide-zinc-900/50">
        {loading ? <LoadingState /> : topics.length === 0 ? <EmptyState /> : topics.map((topic: ForumTopicItem) => (
          <ForumTopicCard key={topic._id} topic={topic} isCaesar={isCaesar} onDelete={() => {
            adminDeleteForumTopic(topic._id).then(res => {
              if (res.success) { toast.success("Noise purged"); onTopicCreated() }
              else toast.error(res.error)
            })
          }} />
        ))}
      </div>
    </main>
  )
}

function RightColumn({ authorities, userRespect, isSignedIn }: any) {
  return (
    <aside className="hidden xl:block w-[320px] min-h-screen sticky top-0 border-l border-zinc-900/50">
      <div className="p-6 space-y-6">
        {isSignedIn && <RespectEnergyCard userRespect={userRespect} />}
        <TopAuthoritiesCard authorities={authorities} />
        <TrendingAxiomsCard />
      </div>
    </aside>
  )
}

function StartDiscussionBox({ userRespect, isSignedIn, onTopicCreated }: { userRespect: any, isSignedIn: boolean, onTopicCreated: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("GENERAL")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canCreate = isSignedIn && (userRespect.respectPoints >= 3)

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) { toast.error("Title and content required"); return }
    setIsSubmitting(true)
    const res = await createForumTopic({ title: title.trim(), content: content.trim(), category, type: "GENERAL" as ForumTopicType })
    setIsSubmitting(false)
    if (res.success) { toast.success("Topic created"); setTitle(""); setContent(""); setShowForm(false); onTopicCreated() }
    else toast.error(res.error || "Failed to create topic")
  }

  if (!isSignedIn) return (
    <div className="p-6 border-b border-zinc-900/50">
      <div className="bg-zinc-950 rounded-2xl p-6 border border-zinc-900/50 text-center">
        <Lock className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
        <p className="text-zinc-400 text-sm">Sign in to join the Arena</p>
      </div>
    </div>
  )

  if (!showForm) return (
    <div className="p-6 border-b border-zinc-900/50">
      <button onClick={() => canCreate && setShowForm(true)} disabled={!canCreate} className={cn("w-full flex items-center gap-4 p-4 rounded-2xl transition-all", canCreate ? "bg-zinc-950 hover:bg-zinc-900 border border-zinc-800/50" : "bg-zinc-950/50 border border-zinc-900/30 cursor-not-allowed")}>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", canCreate ? "bg-purple-600/20" : "bg-zinc-900")}>
          <PenLine className={cn("h-5 w-5", canCreate ? "text-purple-400" : "text-zinc-600")} />
        </div>
        <div className="flex-1 text-left">
          <p className={cn("text-sm font-medium", canCreate ? "text-white" : "text-zinc-500")}>{canCreate ? "Start a discussion..." : "Requires 3 Respect Points to post"}</p>
          <p className="text-xs text-zinc-600">{canCreate ? "Share your wisdom with the Arena" : `You have ${userRespect.respectPoints} Respect Points`}</p>
        </div>
        {!canCreate && <div className="flex items-center gap-1 text-xs text-zinc-500"><Shield className="h-3 w-3" />Locked</div>}
      </button>
    </div>
  )

  return (
    <div className="p-6 border-b border-zinc-900/50">
      <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-800/50">
        <div className="flex items-center gap-2 mb-4"><PenLine className="h-4 w-4 text-purple-400" /><span className="text-sm font-medium text-white">Start Discussion</span></div>
        <Input placeholder="Title your discourse..." value={title} onChange={(e) => setTitle(e.target.value)} className="mb-3 bg-zinc-950 border-zinc-800 rounded-xl text-white placeholder:text-zinc-600" />
        <Textarea placeholder="What wisdom do you bring to the Arena?" value={content} onChange={(e) => setContent(e.target.value)} className="min-h-[100px] bg-zinc-950 border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 resize-none mb-3" />
        <div className="flex items-center gap-2 mb-4">
          {CATEGORIES.slice(0, 6).map(cat => (
            <button key={cat.id} onClick={() => setCategory(cat.id)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-all", category === cat.id ? "bg-purple-600/20 text-purple-400 border border-purple-600/30" : "bg-zinc-900 text-zinc-500 hover:text-zinc-300")}>{cat.label}</button>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <button onClick={() => setShowForm(false)} className="text-xs text-zinc-500 hover:text-zinc-300">Cancel</button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !title.trim() || !content.trim()} className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl" size="sm">
            {isSubmitting ? <span className="flex items-center gap-2"><span className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full" />Posting...</span> : <span className="flex items-center gap-2"><Send className="h-3 w-3" />Post to Arena</span>}
          </Button>
        </div>
      </div>
    </div>
  )
}

function RespectEnergyCard({ userRespect }: { userRespect: any }) {
  return (
    <div className="bg-gradient-to-br from-purple-950/50 to-indigo-950/50 rounded-2xl p-5 border border-purple-500/20">
      <div className="flex items-center gap-2 mb-4"><Zap className={cn("h-4 w-4", userRespect.canGive ? "text-yellow-400 fill-yellow-400" : "text-zinc-600")} /><h3 className="text-sm font-bold text-white">Respect Energy</h3></div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><Crown className="h-4 w-4 text-purple-400" /><span className="text-lg font-bold text-white">{userRespect.respectPoints}</span><span className="text-xs text-zinc-500">Respect Points</span></div>
        <div className={cn("px-2 py-1 rounded-lg text-xs font-medium", userRespect.canGive ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30")}>{userRespect.canGive ? "Ready" : "Depleted"}</div>
      </div>
      {!userRespect.canGive && <p className="text-xs text-red-400">Recharges in {userRespect.daysRemaining} day{userRespect.daysRemaining !== 1 ? 's' : ''}</p>}
      <p className="text-[10px] text-zinc-600 mt-2">Give respect to gain more capacity</p>
    </div>
  )
}

function TopAuthoritiesCard({ authorities }: { authorities: Authority[] }) {
  return (
    <div className="bg-zinc-950/50 rounded-2xl p-5 border border-zinc-900/50">
      <div className="flex items-center gap-2 mb-4"><Crown className="h-4 w-4 text-yellow-500" /><h3 className="text-sm font-bold text-white">Top Authorities</h3></div>
      <div className="space-y-3">
        {authorities.map((auth, index) => (
          <div key={auth._id} className="flex items-center gap-3">
            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold", index === 0 ? "bg-yellow-500/20 text-yellow-500" : index === 1 ? "bg-zinc-700 text-zinc-400" : index === 2 ? "bg-orange-900/30 text-orange-500" : "text-zinc-600")}>{index + 1}</span>
            <div className="w-7 h-7 rounded-full bg-zinc-900 overflow-hidden ring-1 ring-zinc-800">
              {auth.avatar ? <img src={auth.avatar} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs text-zinc-500">{(auth.displayName || auth.username || "?").charAt(0).toUpperCase()}</div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium truncate", auth.role === "caesar" ? "text-yellow-500" : "text-white")}>{auth.displayName || auth.username || "Unknown"}</p>
              <div className="flex items-center gap-2"><span className="text-[10px] text-zinc-500 uppercase">{auth.rank}</span>{auth.role === "caesar" && <span className="text-[10px] text-yellow-500/80">Caesar</span>}</div>
            </div>
            <div className="flex items-center gap-1"><Crown className="h-3 w-3 text-purple-400" /><span className="text-xs text-zinc-400">{auth.respectPoints}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrendingAxiomsCard() {
  return (
    <div className="bg-zinc-950/50 rounded-2xl p-5 border border-zinc-900/50">
      <div className="flex items-center gap-2 mb-4"><Flame className="h-4 w-4 text-orange-500" /><h3 className="text-sm font-bold text-white">Trending Axioms</h3></div>
      <div className="space-y-3">
        {TRENDING_AXIOMS.map((axiom, i) => (
          <div key={i} className="flex gap-3"><span className="text-zinc-600 font-mono text-xs">{String(i + 1).padStart(2, '0')}</span><p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">"{axiom.text}"</p></div>
        ))}
      </div>
    </div>
  )
}

function ForumTopicCard({ topic, isCaesar, onDelete }: { topic: ForumTopicItem; isCaesar: boolean; onDelete: () => void }) {
  return (
    <div className="p-6 hover:bg-zinc-950/50 transition-colors group">
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-purple-400 transition-colors"><TrendingUp className="h-4 w-4" /></button>
          <span className="text-xs font-bold text-white">{topic.likesCount || 0}</span>
        </div>
        <div className="flex-1 min-w-0">
          {topic.type !== "GENERAL" && (
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium", topic.type === "ARTICLE_REF" ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20")}>
                <Hash className="h-3 w-3" />{topic.type === "ARTICLE_REF" ? "Article Discussion" : "Culture Discussion"}
              </span>
            </div>
          )}
          <Link href={`/forum/topic/${topic._id}`}><h3 className="text-lg font-semibold text-white mb-1 group-hover:text-purple-400 transition-colors line-clamp-1">{topic.title}</h3></Link>
          <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2">
            <span className="text-zinc-400">{topic.authorName || "Anonymous"}</span><span>•</span><span>{formatDistanceToNow(topic.createdAt, { addSuffix: true })}</span><span>•</span><span className="flex items-center gap-1"><Eye className="h-3 w-3" />{topic.views}</span><span>•</span><span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{topic.repliesCount}</span>
          </div>
          <p className="text-sm text-zinc-400 line-clamp-2">{topic.content}</p>
          <div className="mt-3"><span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-800">{topic.category}</span></div>
        </div>
        {isCaesar && <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-zinc-600 hover:text-red-400 hover:bg-red-950/30 rounded-xl" title="Purge Noise"><Trash2 className="h-4 w-4" /></button>}
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="p-8 space-y-4">
      {[1, 2, 3].map(i => <div key={i} className="animate-pulse"><div className="h-4 bg-zinc-900 rounded w-3/4 mb-2" /><div className="h-3 bg-zinc-900 rounded w-1/2" /></div>)}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-zinc-950 flex items-center justify-center border border-zinc-900 mb-4"><MessageSquare className="h-8 w-8 text-zinc-700" /></div>
      <p className="text-zinc-500">The Arena awaits its first challenger</p>
      <p className="text-xs text-zinc-600 mt-2">Be the one to start the discourse</p>
    </div>
  )
}

const CATEGORIES = [
  { id: "all", label: "All Topics", icon: MessageSquare, color: "text-zinc-400" },
  { id: "philosophy", label: "Philosophy", icon: Brain, color: "text-amber-400" },
  { id: "technology", label: "Technology", icon: Cpu, color: "text-blue-400" },
  { id: "cinema", label: "Cinema", icon: Film, color: "text-pink-400" },
  { id: "books", label: "Books", icon: BookOpen, color: "text-emerald-400" },
  { id: "relationships", label: "Relationships", icon: Heart, color: "text-rose-400" },
  { id: "lifestyle", label: "Lifestyle", icon: Coffee, color: "text-cyan-400" },
  { id: "finance", label: "Finance & Career", icon: Landmark, color: "text-green-400" },
]

const TRENDING_AXIOMS = [
  { text: "The unexamined life is not worth living. - Socrates", source: "philosophy" },
  { text: "Discipline equals freedom. - Jocko Willink", source: "self-improvement" },
  { text: "Software is eating the world. - Marc Andreessen", source: "technology" },
  { text: "Compound interest is the eighth wonder of the world. - Einstein", source: "finance" },
  { text: "The quality of your life is the quality of your relationships. - Tony Robbins", source: "relationships" },
]
