"use client"

import { useState } from "react"
import { BookOpen, Film, Star, Heart } from "lucide-react"
import { CultureTab } from "@/components/profile/culture-tab"
import { AuthorReviews } from "@/components/profile/author-reviews"
import { ArticleCard } from "@/components/feed/article-card"
import { cn } from "@/lib/utils"

interface ProfileTabsProps {
  userId: string
  isOwnProfile: boolean
  authorName: string
  articles: any[]
  initialMedia?: any[]
}

export function ProfileTabs({ userId, isOwnProfile, authorName, articles, initialMedia = [] }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<"articles" | "culture" | "reviews" | "likes">("articles")

  const tabs = [
    { id: "articles" as const, label: "Articles", icon: BookOpen, count: articles.length },
    { id: "culture" as const, label: "Culture", icon: Film, count: initialMedia.length },
    { id: "reviews" as const, label: "Reviews", icon: Star, count: 0 },
    { id: "likes" as const, label: "Likes", icon: Heart, count: 0 },
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
          <div className="p-4">
            <AuthorReviews
              authorId={userId}
              authorName={authorName}
              isOwnProfile={isOwnProfile}
            />
          </div>
        )}

        {activeTab === "likes" && (
          <div className="py-20 text-center px-4">
            <Heart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-extrabold">No likes yet</h3>
            <p className="text-zinc-500 text-sm mt-1">
              Articles they&apos;ve appreciated will show up here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
