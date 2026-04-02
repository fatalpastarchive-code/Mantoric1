"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Film, Star, Heart, MessageSquare, Heart as HeartIcon } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { CultureTab } from "@/components/profile/culture-tab"
import { AuthorReviews } from "@/components/profile/author-reviews"
import { ArticleCard } from "@/components/feed/article-card"
import { cn } from "@/lib/utils"

interface ProfileTabsProps {
  userId: string
  isOwnProfile: boolean
  authorName: string
  articles: any[]
  forumTopics: any[]
  initialMedia?: any[]
  totalLikes?: number
}

export function ProfileTabs({ userId, isOwnProfile, authorName, articles, forumTopics, initialMedia = [], totalLikes = 0 }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"articles" | "culture" | "reviews" | "forum">("articles")

  const tabs = [
    { id: "articles" as const, label: "Articles", icon: BookOpen, count: articles.length },
    { id: "forum" as const, label: "Forum", icon: MessageSquare, count: forumTopics.length },
    { id: "culture" as const, label: "Culture", icon: Film, count: initialMedia.length },
    { id: "reviews" as const, label: "Reviews", icon: Star, count: 0 },
  ]

  return (
    <div className="mt-2 border-t border-border/40">
      {/* Tab Navigation - Fixed 4 columns */}
      <div className="grid grid-cols-4 bg-background sticky top-0 z-10 border-b border-border/40">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-2 sm:px-4 py-4 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1 sm:gap-2",
              activeTab === tab.id
                ? "text-foreground border-b-4 border-primary"
                : "text-muted-foreground hover:bg-secondary/50"
            )}
          >
            <tab.icon className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.label.slice(0, 3)}</span>
            <span className={cn(
              "text-xs px-1.5 sm:px-2 py-0.5 rounded-full min-w-[1.5rem] text-center",
              activeTab === tab.id ? "bg-primary/20" : "bg-secondary"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="divide-y divide-border/40">
        {activeTab === "articles" && (
          <>
            {articles.length === 0 ? (
              <div className="py-20 text-center px-4">
                <BookOpen className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-extrabold">No articles yet</h3>
                <p className="text-zinc-500 text-sm mt-1">
                  {isOwnProfile ? "Start writing to share your knowledge." : "When they post, their articles will show up here."}
                </p>
              </div>
            ) : (
              articles.map(article => (
                <ArticleCard key={article.id} {...article} />
              ))
            )}
          </>
        )}

        {activeTab === "culture" && (
          <div className="p-4">
            <CultureTab 
              userId={userId} 
              isOwnProfile={isOwnProfile} 
              initialMedia={initialMedia}
            />
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="p-4 space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-red-500/10 to-purple-500/10 border border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-red-500/20">
                  <HeartIcon className="h-6 w-6 text-red-400 fill-red-400" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">Total Appreciation</h4>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Likes received from archive entries</p>
                </div>
              </div>
              <div className="text-3xl font-black text-white">{totalLikes}</div>
            </div>

            <AuthorReviews
              authorId={userId}
              authorName={authorName}
              isOwnProfile={isOwnProfile}
            />
          </div>
        )}

        {activeTab === "forum" && (
          <div className="divide-y divide-border/40">
            {forumTopics.length === 0 ? (
              <div className="py-20 text-center px-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-extrabold">No discussions yet</h3>
                <p className="text-zinc-500 text-sm mt-1">
                  {isOwnProfile ? "Start a discussion in the Arena to engage the community." : "When they start a discussion, it will show up here."}
                </p>
              </div>
            ) : (
              forumTopics.map((topic: any) => (
                <Link 
                  key={topic._id} 
                  href={`/forum/topic/${topic._id}`}
                  className="block p-5 hover:bg-secondary/30 transition-all group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors mb-1">
                        {topic.title}
                      </h4>
                      <p className="text-sm text-zinc-500 line-clamp-1 mb-2">
                        {topic.content}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        <span>{topic.category}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(topic.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-zinc-600 bg-zinc-900/50 px-2 py-1 rounded-lg border border-zinc-800">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span className="text-xs font-bold">{topic.repliesCount || 0}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
