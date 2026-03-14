import { notFound } from "next/navigation"
import Image from "next/image"
import ReactMarkdown from "react-markdown"
import { articles, users } from "@/lib/db/collections"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { Badge } from "@/components/ui/badge"
import { Clock, Crown, ArrowLeft } from "lucide-react"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { formatDistanceToNow } from "date-fns"
import { clerkClient } from "@clerk/nextjs/server"
import Link from "next/link"
import { DeleteButton } from "@/components/article/delete-button"

// Simple formatter hook
function getRankColor(rank: string): string {
  switch (rank.toLowerCase()) {
    case "caesar": return "badge-caesar text-background"
    case "diamond": return "badge-diamond text-background"
    case "platinum": return "badge-platinum text-background"
    case "gold": return "badge-gold text-background"
    case "silver": return "badge-silver text-background"
    case "bronze": return "badge-bronze text-background"
    case "praetor": return "badge-praetor text-background"
    case "newbie": default: return "bg-secondary text-muted-foreground border-border/50"
  }
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  
  const col = await articles()
  const article = await col.findOne({ slug })
  
  if (!article) {
    notFound()
  }

  // Resolve author
  const usersCol = await users()
  const authorDoc = await usersCol.findOne({ 
    $or: [{ _id: article.authorId as any }, { clerkId: article.authorId }] 
  })

  let clerkAvatar = null
  if (article.authorId.startsWith("user_")) {
    try {
      const client = await clerkClient()
      const cu = await client.users.getUser(article.authorId)
      clerkAvatar = cu.imageUrl
    } catch(e) {}
  }

  const finalAvatar = clerkAvatar || authorDoc?.avatar || authorDoc?.imageUrl || undefined
  const authorName = authorDoc?.displayName || article.authorName || "Mantoric Author"
  const rank = authorDoc?.rank || "Scholar"
  const isCaesar = article.authorId === CAESAR_CLERK_ID
  const displayImage = article.coverImage || article.imageUrl

  const publishDate = article.publishedAt || article.createdAt
  let dateStr = "recently"
  try {
    dateStr = formatDistanceToNow(new Date(publishDate), { addSuffix: true })
  } catch (e) {}

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar activeCategory={article.category} />}
      mainContent={
        <div className="flex flex-col pb-20 max-w-2xl mx-auto w-full">
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Back to Feed
            </Link>
            
            <DeleteButton articleId={article._id!.toString()} />
          </div>

          {/* Article Header */}
          <header className="space-y-6 mb-10">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1 text-xs">
                {article.category}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Clock className="h-3.5 w-3.5" />
                <span>{article.readTime} min read</span>
              </div>
            </div>

            <h1 className="font-heading text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
              {article.title}
            </h1>

            {/* Author Block */}
            <div className="flex items-center gap-4 pt-4 border-t border-border/40">
              <div className={`relative h-12 w-12 overflow-hidden rounded-full bg-accent ring-2 ${isCaesar ? "caesar-ring ring-[#9333ea]" : "ring-border"}`}>
                {finalAvatar ? (
                  <Image src={finalAvatar} alt={authorName} fill unoptimized className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-bold text-foreground">
                    {authorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex flex-col">
                <span className={`text-base font-bold ${isCaesar ? "caesar-name" : "text-foreground"}`}>
                  {authorName}
                </span>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  {isCaesar ? (
                    <Badge className="mantoric-role-badge badge-caesar border-0 font-bold tracking-wide text-background">
                      <Crown className="mr-0.5 h-2 w-2" />
                      Caesar
                    </Badge>
                  ) : (
                    <Badge className={`mantoric-role-badge font-bold uppercase tracking-wide border-0 ${getRankColor(rank)}`}>
                      {rank}
                    </Badge>
                  )}
                  <span>&bull;</span>
                  <span className="font-medium text-foreground/80">{dateStr}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Cover Image */}
          <div className="relative aspect-[21/9] w-full mb-12 overflow-hidden rounded-2xl border border-border/30 shadow-2xl ring-1 ring-white/5 bg-gradient-to-br from-secondary via-accent to-secondary/50">
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={article.title}
                className="object-cover w-full h-full transition-transform duration-700 hover:scale-105" 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none">
                <span className="font-heading text-6xl font-black tracking-[0.2em] text-[#9333ea]/20 uppercase">Mantoric</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
          </div>

          {/* Clean Markdown Article Content */}
          <article className="prose-mantoric prose prose-invert prose-lg max-w-none text-foreground/90 selection:bg-emerald-500/30">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </article>

          {/* Tags Footer */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-10 mt-10 border-t border-border/30">
              {article.tags.map((tag: string) => (
                <span key={tag} className="rounded-full bg-secondary/30 border border-border/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground hover:bg-secondary">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      }
      rightSidebar={<RightSidebar />}
    />
  )
}
