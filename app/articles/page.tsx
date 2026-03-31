import { fetchArticles } from "@/lib/db/queries"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { ArticleCard } from "@/components/feed/article-card"
import { currentUser } from "@clerk/nextjs/server"
import { resolveMantoricRole } from "@/lib/auth/roles"
import { PenLine, BookOpen } from "lucide-react"
import Link from "next/link"

export const revalidate = 60

export default async function ArticlesPage() {
  const articles = await fetchArticles({ limit: 50 })
  const user = await currentUser()
  const role = await resolveMantoricRole(user)
  
  const canPublish = role === "Caesar" || role === "Senator"

  const mainContent = (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-zinc-800/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <BookOpen className="h-5 w-5 text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Articles</h1>
        </div>
        
        {canPublish && (
          <Link
            href="/publish"
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-zinc-200 text-black text-sm font-bold rounded-xl transition-all shadow-lg shadow-white/5 active:scale-95"
          >
            <PenLine className="h-4 w-4" />
            Publish
          </Link>
        )}
      </div>

      <div className="flex flex-col divide-y divide-zinc-800/50">
        {articles.length === 0 ? (
          <div className="mx-4 my-12 flex flex-col items-center gap-6 rounded-3xl bg-zinc-900/30 p-16 text-center border border-zinc-800/50">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800">
              <BookOpen className="h-10 w-10 text-zinc-700" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                No articles yet
              </p>
              <p className="mt-2 text-sm text-zinc-500 max-w-xs mx-auto font-light">
                The archive is currently empty. Check back soon for new insights.
              </p>
            </div>
          </div>
        ) : (
          articles.map((article) => (
            <ArticleCard
              key={article.id}
              id={article.id}
              slug={article.slug}
              title={article.title}
              excerpt={article.excerpt}
              imageUrl={article.imageUrl}
              category={article.category}
              likes={article.likes}
              comments={article.comments}
              readTime={article.readTime}
              createdAt={article.createdAt}
              author={{
                id: article.author.clerkId || article.author.username || "anon",
                clerkId: article.author.clerkId,
                username: article.author.username,
                name: article.author.name,
                avatar: article.author.avatar,
                rank: article.author.rank,
                xp: article.author.xp,
                respectPoints: article.author.respectPoints,
                subscriptionTier: article.author.subscriptionTier,
                isPremium: article.author.isPremium,
                bio: article.author.bio
              }}
            />
          ))
        )}
      </div>
    </div>
  )

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar activeCategory="articles" />}
      mainContent={mainContent}
      rightSidebar={<RightSidebar />}
    />
  )
}
