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
        <div className="flex flex-col gap-8 py-0">
          {activeCategory && (
            <div className="flex flex-col gap-4 px-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tighter text-foreground">
                  {activeCategory.label}
                </h1>
              </div>
              <a
                href="/"
                className="rounded-2xl bg-white/5 px-4 py-2 text-xs font-semibold text-zinc-400 transition-all hover:bg-white/10 hover:text-white"
              >
                ← All
              </a>
            </div>
          )}

          {articles.length === 0 ? (
            <div className="mx-4 flex flex-col items-center gap-6 rounded-3xl bg-white/5 p-16 text-center backdrop-blur-md">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5">
                <svg className="h-10 w-10 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">
                  {activeCategory ? `No articles in ${activeCategory.label} yet` : "No articles yet"}
                </p>
                <p className="mt-2 text-sm text-zinc-500 max-w-xs mx-auto font-light">
                  Be the first to publish and share your knowledge with the community.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <InfiniteFeed 
                initialArticles={articles as any} 
                category={categoryLabel}
              />
            </div>
          )}
        </div>
      }
      rightSidebar={<RightSidebar />}
    />
  )
}
