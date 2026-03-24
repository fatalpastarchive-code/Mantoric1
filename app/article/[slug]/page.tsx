import { notFound } from "next/navigation"
import { articles, users } from "@/lib/db/collections"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { clerkClient } from "@clerk/nextjs/server"
import { ArticleContent } from "@/components/article/article-content"
import { auth } from "@clerk/nextjs/server"

interface ArticlePageProps {
  params: Promise<{ slug: string }>
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const { userId } = await auth()
  
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

  const finalAvatar = clerkAvatar || authorDoc?.avatar || (authorDoc as any)?.imageUrl || undefined
  const authorName = authorDoc?.displayName || article.authorName || "Mantoric Author"
  const rank = authorDoc?.rank || "Scholar"
  const isCaesar = article.authorId === CAESAR_CLERK_ID
  const isVerifiedExpert = authorDoc?.isVerifiedExpert || false
  const expertField = authorDoc?.expertField || ""

  const isOwnArticle = userId === article.authorId

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar activeCategory={article.category?.toLowerCase().replace(/\s+/g, '-')} />}
      rightSidebar={<RightSidebar category={article.category?.toLowerCase().replace(/\s+/g, '-')} />}
      mainContent={
        <ArticleContent 
          article={{
            _id: String(article._id),
            slug: article.slug,
            title: article.title,
            content: article.content,
            excerpt: article.excerpt,
            imageUrl: article.imageUrl,
            coverImage: article.coverImage,
            category: article.category,
            tags: article.tags,
            readTime: article.readTime || 1,
            authorId: article.authorId,
            authorName: article.authorName,
            averageRating: article.averageRating || 0,
            ratingsCount: article.ratingsCount || 0,
            publishedAt: article.publishedAt,
            createdAt: article.createdAt,
          }}
          author={{
            name: authorName,
            avatar: finalAvatar,
            rank,
            isCaesar,
            isVerifiedExpert,
            expertField,
            userId: article.authorId,
            respectPoints: authorDoc?.respectPoints || 0,
            xp: authorDoc?.xp || 0,
            banner: authorDoc?.banner || (authorDoc as any)?.bannerUrl || undefined,
          }}
          isOwnArticle={isOwnArticle}
        />
      }
    />
  )
}
