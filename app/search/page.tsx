import { searchAll } from "@/lib/db/queries"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import Link from "next/link"
import { BookOpen, User as UserIcon, Search as SearchIcon } from "lucide-react"

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ""
  
  const results = query.trim() ? await searchAll(query.trim(), 20) : { articles: [], profiles: [] }
  const totalResults = results.articles.length + results.profiles.length

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar />}
      mainContent={
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Search Results
            </h1>
            {query ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {totalResults} result{totalResults !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Enter a search query to find articles and profiles.
              </p>
            )}
          </div>

          {!query.trim() ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-12 text-center backdrop-blur-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
                <SearchIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Use the search bar above to find articles and profiles.</p>
            </div>
          ) : totalResults === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-xl border border-border/50 bg-card/50 p-12 text-center backdrop-blur-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
                <SearchIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">No results found</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try different keywords or check the spelling.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* Articles */}
              {results.articles.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <BookOpen className="h-4 w-4" />
                    Articles ({results.articles.length})
                  </div>
                  <div className="flex flex-col gap-3">
                    {results.articles.map((article) => (
                      <Link
                        key={article.id}
                        href={`/article/${article.slug}`}
                        className="group rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-card"
                      >
                        <div className="flex items-start gap-4">
                          {article.imageUrl && (
                            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-secondary">
                              <img src={article.imageUrl} alt={article.title} className="h-full w-full object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading text-base font-semibold text-foreground group-hover:text-foreground/80 transition-colors line-clamp-1">
                              {article.title}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                              {article.excerpt}
                            </p>
                            <span className="mt-2 inline-block rounded-full bg-secondary/70 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              {article.category}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Profiles */}
              {results.profiles.length > 0 && (
                <div>
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <UserIcon className="h-4 w-4" />
                    Profiles ({results.profiles.length})
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {results.profiles.map((profile) => (
                      <Link
                        key={profile.id}
                        href={`/profile/${profile.username}`}
                        className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-card"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent">
                          {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.displayName} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold text-foreground">
                              {profile.displayName.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {profile.displayName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{profile.username} · {profile.rank} · {profile.xp.toLocaleString()} XP
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      }
      rightSidebar={<RightSidebar />}
    />
  )
}
