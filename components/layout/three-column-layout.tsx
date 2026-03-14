"use client"

import { ReactNode, useState, useEffect, useRef } from "react"
import { Search, Crown, Landmark, BookOpen, User as UserIcon, X } from "lucide-react"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"

interface ThreeColumnLayoutProps {
  leftSidebar: ReactNode
  mainContent: ReactNode
  rightSidebar: ReactNode
}

interface SearchResult {
  articles: Array<{
    id: string
    slug: string
    title: string
    excerpt: string
    category: string
    imageUrl: string
  }>
  profiles: Array<{
    id: string
    username: string
    displayName: string
    avatar: string
    rank: string
    xp: number
  }>
}

export function ThreeColumnLayout({
  leftSidebar,
  mainContent,
  rightSidebar,
}: ThreeColumnLayoutProps) {
  const { user } = useUser()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const didSyncRef = useRef(false)

  const isCaesar = user?.id === CAESAR_CLERK_ID
  const role = (user?.publicMetadata?.role as string | undefined) ?? "User"

  // Close when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Ensure MongoDB user document exists after Clerk sign-in
  useEffect(() => {
    if (!user?.id) return
    if (didSyncRef.current) return
    didSyncRef.current = true

    ;(async () => {
      try {
        await fetch("/api/user/sync", { method: "POST" })
      } catch {
        // silently fail
      }
    })()
  }, [user?.id])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    
    if (!searchQuery.trim()) {
      setSearchResults(null)
      setShowResults(false)
      return
    }

    setIsSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data)
          setShowResults(true)
        }
      } catch {
        // silently fail
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowResults(false)
    }
  }

  const totalResults = (searchResults?.articles?.length || 0) + (searchResults?.profiles?.length || 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 items-center justify-center">
              <img src="/logo.png" alt="Mantoric" className="h-10 w-auto object-contain" />
            </div>
            <span className="font-heading hidden text-xl font-bold tracking-tight text-foreground sm:block">
              Mantoric
            </span>
          </Link>

          {/* Search Bar - Center */}
          <div ref={searchRef} className="relative mx-auto flex-1 max-w-xl">
            <form onSubmit={handleSearchSubmit}>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="global-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults && setShowResults(true)}
                placeholder="Search articles, topics, profiles..."
                className="w-full rounded-lg border border-border/50 bg-secondary/50 py-2 pl-10 pr-10 text-sm font-medium text-foreground placeholder:text-muted-foreground/70 transition-all focus:border-border focus:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => { setSearchQuery(""); setShowResults(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </form>

            {/* Search Dropdown */}
            {showResults && searchResults && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-border/70 bg-card/95 shadow-2xl backdrop-blur-xl">
                {totalResults === 0 && !isSearching ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No results found for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  <div className="p-2">
                    {/* Articles */}
                    {searchResults.articles.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <BookOpen className="h-3.5 w-3.5" />
                          Articles
                        </div>
                        {searchResults.articles.map((article) => (
                          <Link
                            key={article.id}
                            href={`/article/${article.slug}`}
                            onClick={() => setShowResults(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {article.title}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {article.category} · {article.excerpt.slice(0, 60)}...
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Profiles */}
                    {searchResults.profiles.length > 0 && (
                      <div className={searchResults.articles.length > 0 ? "mt-2 border-t border-border/50 pt-2" : ""}>
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <UserIcon className="h-3.5 w-3.5" />
                          Profiles
                        </div>
                        {searchResults.profiles.map((profile) => (
                          <Link
                            key={profile.id}
                            href={`/profile/${profile.username}`}
                            onClick={() => setShowResults(false)}
                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent">
                              {profile.avatar ? (
                                <img src={profile.avatar} alt={profile.displayName} className="h-full w-full object-cover" />
                              ) : (
                                <span className="text-xs font-bold text-foreground">
                                  {profile.displayName.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {profile.displayName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                @{profile.username} · {profile.rank} · {profile.xp} XP
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* View all results link */}
                    {totalResults > 0 && (
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={() => setShowResults(false)}
                        className="mt-2 block rounded-lg bg-secondary/50 px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                      >
                        View all results →
                      </Link>
                    )}
                  </div>
                )}

                {isSearching && (
                  <div className="flex items-center justify-center p-4">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-accent sm:block">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-all hover:bg-foreground/90">
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4">
                {/* User Name with Color-Coding */}
                <span className={`hidden text-sm font-bold md:block ${isCaesar ? "caesar-name" : role === "Senator" ? "text-yellow-500" : "text-foreground"}`}>
                  {user?.fullName || user?.username}
                </span>

                {/* Caesar / Senator badge in navbar */}
                {isCaesar ? (
                  <Badge className="mantoric-role-badge badge-caesar sm:flex">
                    <Crown className="mr-1 h-3.5 w-3.5" />
                    Caesar
                  </Badge>
                ) : role === "Senator" ? (
                  <Badge className="mantoric-role-badge badge-senator sm:flex text-black">
                    <Landmark className="mr-1 h-3.5 w-3.5" />
                    Senator
                  </Badge>
                ) : null}
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: isCaesar ? "ring-2 ring-[#9333ea] shadow-[0_0_12px_rgba(147,51,234,0.35)]" : "",
                    }
                  }}
                />
              </div>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Navigation */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-20">{leftSidebar}</div>
          </aside>

          {/* Center - Main Feed */}
          <main className="min-w-0 flex-1">{mainContent}</main>

          {/* Right Sidebar - Widgets/Stats */}
          <aside className="hidden w-72 shrink-0 xl:block">
            <div className="sticky top-20 h-[calc(100vh-5rem)] pb-6">{rightSidebar}</div>
          </aside>
        </div>
      </div>
    </div>
  )
}
