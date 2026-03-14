"use client"

import { TrendingUp, Users, Code, Crown, Landmark, ShieldCheck, Swords, User as UserIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useUser, SignUpButton } from "@clerk/nextjs"
import Link from "next/link"
import { CAESAR_CLERK_ID } from "@/lib/constants"

const trendingTopics = [
  { tag: "stoicism", posts: 234 },
  { tag: "fitness", posts: 189 },
  { tag: "investing", posts: 156 },
  { tag: "productivity", posts: 142 },
  { tag: "mindset", posts: 98 },
]

function getRankColor(rank: string): string {
  const r = rank.toLowerCase()
  switch (r) {
    case "caesar": return "badge-caesar text-white"
    case "senator": return "badge-senator text-black"
    case "praetor": return "badge-praetor text-white"
    case "gladiator": return "badge-gladiator text-white"
    case "newbie": return "badge-newbie text-muted-foreground"
    default: return "bg-secondary text-muted-foreground border-border/50"
  }
}

function getAuraClass(rank: string): string {
  const r = rank.toLowerCase()
  switch (r) {
    case "caesar": return "aura-caesar"
    case "senator": return "aura-senator"
    case "praetor": return "aura-praetor"
    case "gladiator": return "aura-gladiator"
    case "newbie": return "aura-newbie"
    default: return ""
  }
}

function getRoleIcon(role: string) {
  const r = role.toLowerCase()
  switch (r) {
    case "caesar": return <Crown className="mr-1 h-3 w-3" />
    case "senator": return <Landmark className="mr-1 h-3 w-3" />
    case "praetor": return <ShieldCheck className="mr-1 h-3 w-3" />
    case "gladiator": return <Swords className="mr-1 h-3 w-3" />
    default: return <UserIcon className="mr-1 h-3 w-3" />
  }
}

export function RightSidebar() {
  const { isLoaded, isSignedIn, user } = useUser()
  const role = ((user?.publicMetadata?.role as string | undefined) ?? "Newbie") as string
  const isCaesar = user?.id === CAESAR_CLERK_ID

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Trending Topics */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="font-heading flex items-center gap-2 text-sm font-semibold tracking-tight">
            <TrendingUp className="h-4 w-4 text-blue-400" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {trendingTopics.map((topic) => (
            <a
              key={topic.tag}
              href={`/search?q=${topic.tag}`}
              className="group flex items-center gap-1.5 rounded-full border border-border/50 bg-secondary/50 px-3 py-1.5 transition-all duration-200 hover:border-border hover:bg-accent"
            >
              <span className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                #{topic.tag}
              </span>
              <span className="text-[10px] tabular-nums text-muted-foreground/60">
                {topic.posts}
              </span>
            </a>
          ))}
        </CardContent>
      </Card>

      {/* User Profile / Auth CTA */}
      <div className="mt-auto">
        {isSignedIn ? (
          <div className={role.toLowerCase() === "caesar" ? "caesar-card-wrapper" : ""}>
          <Card className={`bg-card/50 backdrop-blur-sm h-full ${getAuraClass(role)}`}>
            <CardContent className="p-4">
            {!isLoaded || !user ? (
              <div className="flex flex-col gap-3">
                <div className="h-16 w-full animate-pulse rounded-lg bg-muted/40" />
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-muted/40" />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="h-3 w-24 animate-pulse rounded bg-muted/40" />
                    <div className="h-3 w-16 animate-pulse rounded bg-muted/40" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href={user.username ? `/profile/${user.username}` : "#"}
                  className="flex items-center gap-3 hover:bg-secondary/60 rounded-lg px-2 py-1.5 transition-colors"
                >
                  <div className={`relative h-12 w-12 overflow-hidden rounded-full bg-accent ring-2 ${role.toLowerCase() === 'caesar' ? 'ring-[#9333ea]' : 'ring-border'}`}>
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.fullName || "User"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-lg font-bold text-foreground">
                        {(user.fullName || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className={`font-heading text-sm font-bold line-clamp-1 ${isCaesar ? "caesar-name" : "text-foreground"}`}>
                      {user.fullName}
                    </span>
                    <span className="text-xs text-muted-foreground line-clamp-1">
                      {user.username ? `@${user.username}` : role}
                    </span>
                  </div>
                  <Badge
                    className={`mantoric-role-badge font-bold uppercase tracking-wide border-0 ${getRankColor(role)}`}
                  >
                    {getRoleIcon(role)}
                    {role}
                  </Badge>
                </Link>

                {/* Level Progress */}
                <div className="mt-1 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">Level 1</span>
                    <span suppressHydrationWarning className="text-muted-foreground">
                      0 XP
                    </span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </div>
            )}
          </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4 flex flex-col items-center text-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent">
              <Code className="h-6 w-6 text-foreground" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm">Join the Community</h3>
              <p className="text-xs text-muted-foreground mt-1 text-balance">Sign in to track your XP, earn ranks, and share knowledge.</p>
            </div>
            <SignUpButton mode="modal">
              <button className="w-full rounded-lg bg-foreground py-2 text-xs font-bold text-background transition-all hover:bg-foreground/90 mt-2">
                Get Started
              </button>
            </SignUpButton>
          </CardContent>
        </Card>
        )}
      </div>
    </div>
  )
}
