"use client"

import { ReactNode, useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Search, Crown, Landmark, BookOpen, User as UserIcon, X, Home, Menu, Zap, ShieldCheck, Sparkles, Palette as PaletteIcon } from "lucide-react"
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatMetric } from "@/lib/utils"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { PrestigeBox } from "@/components/sidebar/prestige-box"
import { Award, Palette } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [userStats, setUserStats] = useState<{ rank: string; badgeLevel: string; respectCapacity: number; respectPoints: number } | null>(null)
  const [respectStatus, setRespectStatus] = useState<{ canGive: boolean; daysRemaining: number } | null>(null)

  useEffect(() => {
    setMounted(true)
    if (user?.username) {
      fetch(`/api/user/profile?username=${user.username}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUserStats({
              rank: data.user.rank || "Newbie",
              badgeLevel: data.user.badgeLevel || "Newbie",
              respectCapacity: data.user.respectCapacity || 1,
              respectPoints: data.user.respectPoints || 0
            })
          }
        })
        .catch(err => console.error("Failed to fetch topbar user stats:", err))

      // Fetch respect status
      fetch("/api/user/respect")
        .then(res => res.json())
        .then(data => {
          if (data.respectPoints !== undefined) {
            setRespectStatus({
              canGive: data.canGiveRespect,
              daysRemaining: data.daysRemaining
            })
          }
        })
        .catch(err => console.error("Failed to fetch respect status:", err))
    }
  }, [user?.username])

  const getRankBadgeColor = (rankStr: string) => {
    const r = rankStr.toLowerCase()
    if (r === "caesar") return "bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)] border-red-400/30"
    if (r === "founder") return "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30 shadow-[0_0_10px_rgba(212,175,55,0.2)]"
    if (r === "senator") return "bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] border-purple-400/30"
    if (r === "gladiator") return "bg-zinc-700 text-white border-zinc-500/30"
    if (r === "praetor") return "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)] border-blue-400/30"
    return "bg-zinc-800 text-zinc-400 border-zinc-700"
  }

  const getRankTextColor = (rankStr: string) => {
    const r = rankStr.toLowerCase()
    if (r === "caesar") return "text-purple-500" // User specifically requested purple for Caesar
    if (r === "founder") return "text-[#D4AF37] gold-glow"
    if (r === "senator") return "text-purple-400"
    if (r === "gladiator") return "text-zinc-400"
    if (r === "praetor") return "text-blue-400"
    return "text-white"
  }

  const getRankIcon = (rankStr: string) => {
    const r = rankStr.toLowerCase()
    if (r === "caesar") return <Crown className="w-3 h-3 mr-1 fill-current" />
    if (r === "founder") return <Crown className="w-3 h-3 mr-1 fill-[#D4AF37]" style={{ filter: "drop-shadow(0 0 5px rgba(212,175,55,0.5))" }} />
    if (r === "senator") return <Landmark className="w-3 h-3 mr-1 fill-current" />
    if (r === "gladiator") return <Award className="w-3 h-3 mr-1 fill-current" />
    return null
  }
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false)
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

  // ESC key to close search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchModalOpen(false)
        setShowResults(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
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
      setIsSearchModalOpen(false)
    }
  }

  const totalResults = (searchResults?.articles?.length || 0) + (searchResults?.profiles?.length || 0)

  const isActivePath = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname?.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-background infinite-horizon">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-background/60 backdrop-blur-md flex justify-center border-none">
        <div className="flex w-full max-w-[1170px] items-center px-0">
          {/* Logo Portion - Aligned with Left Sidebar */}
          <div className="w-[260px] shrink-0 hidden lg:flex px-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 overflow-hidden rounded-sm">
                <Image src="/M.jpg" alt="Mantoric" width={32} height={32} className="object-cover" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">Mantoric</span>
            </Link>
          </div>

          {/* Search Portion - Aligned with Center Column */}
          <div className="flex-1 lg:flex-none lg:w-[550px] flex items-center px-0">
            <div 
              className="relative w-full group cursor-pointer"
              onClick={() => setIsSearchModalOpen(true)}
            >
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors" />
              <div className="w-full rounded-full bg-secondary/80 py-2 pl-12 pr-4 text-sm font-light text-muted-foreground border border-border/50 transition-all hover:bg-secondary">
                Search Mantoric...
              </div>
            </div>
          </div>

          {/* Right Portion - Respect Energy & User Profile */}
          <div className="hidden xl:flex xl:w-[260px] shrink-0 items-center justify-end px-4 gap-3">
            <SignedIn>
              {/* Respect Badge - Purple Emblem with Balance (Non-clickable) */}
              {mounted && userStats && (
                <div 
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-950/30 border border-purple-500/30 rounded-full cursor-default"
                  title="Your Respect Points"
                >
                  <ShieldCheck className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-bold text-purple-200">
                    {formatMetric(userStats.respectPoints || 0)}
                  </span>
                </div>
              )}
              <Link 
                href={user?.username ? `/profile/${user.username}` : "#"} 
                className="flex items-center gap-3 hover:bg-accent/50 p-1 pr-2 rounded-full transition-all group"
              >
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-sm font-bold tracking-tight transition-colors",
                      mounted && userStats ? getRankTextColor(userStats.rank !== "Newbie" ? userStats.rank : userStats.badgeLevel) : "text-white"
                    )}>
                      {user?.fullName || user?.username}
                    </span>
                    {mounted && userStats && (userStats.rank !== "Newbie" || userStats.badgeLevel !== "Newbie") && (
                      <div className={cn(
                        "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border flex items-center",
                        getRankBadgeColor(userStats.rank !== "Newbie" ? userStats.rank : userStats.badgeLevel)
                      )}>
                        {getRankIcon(userStats.rank !== "Newbie" ? userStats.rank : userStats.badgeLevel)}
                        {userStats.rank !== "Newbie" ? userStats.rank : userStats.badgeLevel}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-medium leading-none">@{user?.username}</span>
                </div>
                <div className="h-9 w-9 rounded-full overflow-hidden border border-border/50 p-0.5 bg-gradient-to-br from-card to-transparent group-hover:border-primary/50 transition-all">
                  <img src={user?.imageUrl} alt="Profile" className="h-full w-full rounded-full object-cover" />
                </div>
              </Link>
            </SignedIn>
            <SignedOut>
              <SignUpButton mode="modal">
                <Button 
                  className="rounded-full bg-white hover:bg-zinc-200 font-bold text-xs px-6 h-10 border-none text-black shadow-lg transition-all flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-cormorant), serif', letterSpacing: '0.05em' }}
                >
                  <Sparkles className="h-3.5 w-3.5 fill-black" />
                  Sign Up
                </Button>
              </SignUpButton>
            </SignedOut>
          </div>
        </div>
      </header>

      {/* Full Screen Search Overlay */}
      {isSearchModalOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-lg flex flex-col items-center pt-[15vh] px-4 animate-in fade-in duration-300"
          onClick={() => setIsSearchModalOpen(false)}
        >
          <div 
            className="w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearchSubmit} className="relative w-full mb-8">
              <Search className="absolute left-6 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search everything..."
                className="w-full bg-transparent border-none text-4xl md:text-6xl font-bold placeholder:text-zinc-800 focus:ring-0 focus:outline-none py-4 pl-20 pr-4"
              />
            </form>

            {/* Search Results in Overlay */}
            {searchQuery.trim() && (
              <div className="w-full max-h-[60vh] overflow-y-auto no-scrollbar space-y-6">
                {isSearching ? (
                  <div className="flex justify-center py-12">
                    <div className="h-8 w-8 border-4 border-white/10 border-t-white rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {searchResults?.articles && searchResults.articles.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-zinc-500 text-sm font-semibold uppercase tracking-widest px-2">Articles</h3>
                        <div className="grid gap-2">
                          {searchResults.articles.map(a => (
                            <Link 
                              key={a.id} 
                              href={`/article/${a.slug}`}
                              onClick={() => setIsSearchModalOpen(false)}
                              className="group flex flex-col p-4 rounded-3xl hover:bg-accent/30 transition-all border border-transparent hover:border-border/50"
                            >
                              <p className="text-xl font-semibold group-hover:text-foreground transition-colors">{a.title}</p>
                              <p className="text-sm text-zinc-500 line-clamp-1 font-light">{a.excerpt}</p>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults?.profiles && searchResults.profiles.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-zinc-500 text-sm font-semibold uppercase tracking-widest px-2">People</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {searchResults.profiles.map(p => (
                            <Link 
                              key={p.id} 
                              href={`/profile/${p.username}`}
                              onClick={() => setIsSearchModalOpen(false)}
                              className="flex items-center gap-4 p-4 rounded-3xl hover:bg-accent/30 transition-all border border-transparent hover:border-border/50"
                            >
                              <img src={p.avatar} className="h-12 w-12 rounded-2xl object-cover border border-border/30" />
                              <div>
                                <p className="font-semibold text-foreground">@{p.username}</p>
                                <p className="text-sm text-muted-foreground font-light">{p.rank}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {totalResults === 0 && !isSearching && (
                      <div className="py-20 text-center">
                        <p className="text-2xl font-semibold text-zinc-700">No results found for "{searchQuery}"</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          
          <button 
            onClick={() => setIsSearchModalOpen(false)}
            className="fixed top-8 right-8 p-3 rounded-full hover:bg-white/5 transition-all text-zinc-500 hover:text-white"
          >
            <X className="h-8 w-8" />
          </button>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="mx-auto max-w-7xl px-0 lg:px-4 pt-16">
        <div className="flex justify-center">
          {/* Left Sidebar - Navigation (Twitter Style) */}
          <aside className="hidden w-[260px] shrink-0 lg:block h-[calc(100vh-64px)] sticky top-16 overflow-hidden">
            <div className="flex flex-col h-full px-2 py-0">
              {leftSidebar}
            </div>
          </aside>

          {/* Center - Main Feed */}
          <main className="w-full max-w-[650px] min-h-screen border-none bg-background relative z-10">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {mainContent}
            </motion.div>
          </main>

          {/* Right Sidebar - Widgets/Stats */}
          <aside className="hidden w-[260px] shrink-0 xl:block px-4 py-0 border-none relative h-[calc(100vh-64px)] sticky top-16">
            <div className="flex flex-col h-full">
              <div className="flex-1 space-y-3 overflow-y-auto no-scrollbar">
                {rightSidebar}
              </div>
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
          {/* Settings moved to Profile Page */}
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <button onClick={() => setMobileNavOpen(true)} className="p-2">
              <Menu className="h-6 w-6 text-muted-foreground" />
            </button>
            <SheetContent side="left" className="p-0 w-72">
               <SheetHeader className="px-4 py-6">
                 <SheetTitle className="text-left flex items-center gap-3">
                   <div className="h-8 w-8 overflow-hidden rounded-sm">
                     <Image src="/M.jpg" alt="Mantoric" width={32} height={32} className="object-cover" />
                   </div>
                   Mantoric
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
