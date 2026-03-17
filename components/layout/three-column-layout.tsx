"use client"

import { ReactNode, useState, useEffect, useRef } from "react"
import { Search, Crown, Landmark, BookOpen, User as UserIcon, X, Home, Menu } from "lucide-react"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"

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
    respectPoints: number
  }>
}

export function ThreeColumnLayout({
  leftSidebar,
  mainContent,
  rightSidebar,
}: ThreeColumnLayoutProps) {
  const { user } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
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

  const isActivePath = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Grid Layout */}
      <div className="mx-auto max-w-7xl px-0 lg:px-4">
        <div className="flex justify-center">
          {/* Left Sidebar - Navigation (Twitter Style) */}
          <aside className="hidden w-[275px] shrink-0 lg:block h-screen sticky top-0 overflow-y-auto no-scrollbar">
            <div className="flex flex-col h-full px-2 py-4">
              <Link href="/" className="mb-6 px-4 flex items-center gap-3">
                <img src="/logo.png" alt="Mantoric" className="h-8 w-8 object-contain" />
                <span className="text-xl font-black tracking-tight text-foreground">Mantoric</span>
              </Link>
              {leftSidebar}
            </div>
          </aside>

          {/* Center - Main Feed */}
          <main className="w-full max-w-[600px] min-h-screen border-none bg-background/50">
            <div className="sticky top-0 z-40 bg-background/80 border-none backdrop-blur-md px-4 py-4 lg:hidden">
              <div className="flex items-center justify-between">
                <img src="/logo.png" alt="Mantoric" className="h-6 w-6 object-contain" />
                <h1 className="text-lg font-bold">Mantoric</h1>
                <div className="w-6" />
              </div>
            </div>
            {mainContent}
          </main>

          {/* Right Sidebar - Widgets/Stats */}
          <aside className="hidden w-[350px] shrink-0 xl:block px-8 py-4 border-none">
            <div className="sticky top-4 space-y-4">
              <div ref={searchRef} className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => searchResults && setShowResults(true)}
                  placeholder="Search Mantoric"
                  className="w-full rounded-full bg-secondary/80 py-3 pl-12 pr-4 text-sm focus:ring-1 focus:ring-primary border-none focus-visible:ring-offset-0"
                />
                {showResults && searchResults && (
                  <div className="absolute left-0 right-0 top-full mt-2 max-h-[70vh] overflow-y-auto no-scrollbar rounded-xl bg-card shadow-2xl z-50">
                    <div className="p-2">
                       {totalResults === 0 && !isSearching ? (
                         <div className="p-4 text-center text-sm text-muted-foreground">No results</div>
                       ) : (
                         <>
                           {searchResults.articles.map(a => (
                             <Link key={a.id} href={`/article/${a.slug}`} className="block p-3 hover:bg-accent rounded-lg">
                               <p className="text-sm font-bold line-clamp-1">{a.title}</p>
                             </Link>
                           ))}
                           {searchResults.profiles.map(p => (
                             <Link key={p.id} href={`/profile/${p.username}`} className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg">
                               <img src={p.avatar} className="h-8 w-8 rounded-full object-cover" />
                               <div>
                                 <p className="text-sm font-bold">@{p.username}</p>
                                 <p className="text-xs text-muted-foreground">{p.rank}</p>
                               </div>
                             </Link>
                           ))}
                         </>
                       )}
                    </div>
                  </div>
                )}
              </div>
              {rightSidebar}
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-background/90 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-around">
          <Link href="/" className="flex flex-col items-center justify-center p-2">
            <Home className={isActivePath("/") ? "h-6 w-6 text-foreground" : "h-6 w-6 text-muted-foreground"} />
          </Link>
          <button onClick={() => router.push('/search')} className="flex flex-col items-center justify-center p-2">
            <Search className="h-6 w-6 text-muted-foreground" />
          </button>
          <SignedIn>
            <Link href={user?.username ? `/profile/${user.username}` : "/"} className="flex flex-col items-center justify-center p-2">
              <UserIcon className={pathname?.startsWith("/profile") ? "h-6 w-6 text-foreground" : "h-6 w-6 text-muted-foreground"} />
            </Link>
          </SignedIn>
          <SignedOut>
             <SignInButton mode="modal">
               <button className="p-2"><UserIcon className="h-6 w-6 text-muted-foreground" /></button>
             </SignInButton>
          </SignedOut>
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <button onClick={() => setMobileNavOpen(true)} className="p-2">
              <Menu className="h-6 w-6 text-muted-foreground" />
            </button>
            <SheetContent side="left" className="p-0 w-72">
               <SheetHeader className="px-4 py-6">
                 <SheetTitle className="text-left flex items-center gap-3">
                   <img src="/logo.png" alt="Logo" className="h-6 w-6" />
                   Menu
                 </SheetTitle>
                 <SheetDescription className="text-left">
                   Navigation and account settings
                 </SheetDescription>
               </SheetHeader>
               
               <SignedIn>
                 <div className="px-4 py-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden">
                        <img src={user?.imageUrl} alt={user?.fullName || "User"} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground leading-tight">{user?.fullName}</span>
                        <span className="text-xs text-muted-foreground">@{user?.username}</span>
                      </div>
                    </div>
                    <Link 
                      href={user?.username ? `/profile/${user.username}` : "/"} 
                      onClick={() => setMobileNavOpen(false)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      View Profile
                    </Link>
                 </div>
               </SignedIn>

               <div className="p-2">{leftSidebar}</div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  )
}
