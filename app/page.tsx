import { fetchArticles } from "@/lib/db/queries"
import { SLUG_TO_LABEL, CATEGORIES } from "@/lib/constants"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { ArticleComposer } from "@/components/feed/article-composer"
import { InfiniteFeed } from "@/components/feed/infinite-feed"

interface HomeProps {
  searchParams: Promise<{ category?: string }>
}

export const revalidate = 60


export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams
  const categorySlug = params.category
  const categoryLabel = categorySlug ? SLUG_TO_LABEL[categorySlug] : undefined

  const articles = await fetchArticles({
    category: categoryLabel,
    limit: 20,
  })

  const activeCategory = CATEGORIES.find((c) => c.slug === categorySlug)

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar activeCategory={categorySlug} />}
      mainContent={
        <div className="flex flex-col">
          {/* Article Composer */}
          <div className="border-b border-border/50">
            <ArticleComposer />
          </div>

          <div className="flex flex-col gap-4 border-b border-border/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {activeCategory ? activeCategory.label : "Home"}
              </h1>
            </div>
            {activeCategory && (
              <a
                href="/"
                className="rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-xs font-bold text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
              >
                ← All
              </a>
            )}
          </div>

          {articles.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-12 text-center backdrop-blur-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
                <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  {activeCategory ? `No articles in ${activeCategory.label} yet` : "No articles yet"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Be the first to publish and share your knowledge with the community.
                </p>
              </div>
            </div>
          ) : (
            <InfiniteFeed 
              initialArticles={articles as any} 
              category={categoryLabel}
            />
          )}
        </div>
      }
      rightSidebar={<RightSidebar />}
    />
  )
}
