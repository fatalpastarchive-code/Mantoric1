import { notFound } from "next/navigation"
import Image from "next/image"
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server"
import { users, follows, articles } from "@/lib/db/collections"
import { Button } from "@/components/ui/button"
import { FollowButton } from "@/components/profile/follow-button"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { Settings, Crown, Landmark, ShieldCheck, Swords, User as UserIcon } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { resolveMantoricRole, type MantoricRole } from "@/lib/auth/roles"

function getRankColor(rank: string): string {
  const r = rank.toLowerCase()
  switch (r) {
    case "caesar": return "badge-caesar text-white"
    case "senator": return "badge-senator text-black"
    case "praetor": return "badge-praetor text-white"
    case "gladiator": return "badge-gladiator text-white"
    case "newbie": return "badge-newbie text-muted-foreground"
    default: return "bg-secondary text-muted-foreground"
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
    case "caesar": return <Crown className="mr-1.5 h-4 w-4" />
    case "senator": return <Landmark className="mr-1.5 h-4 w-4" />
    case "praetor": return <ShieldCheck className="mr-1.5 h-4 w-4" />
    case "gladiator": return <Swords className="mr-1.5 h-4 w-4" />
    default: return <UserIcon className="mr-1.5 h-4 w-4" />
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  // Next.js Turbopack pattern: params is a Promise, so await it first
  const { username } = await params

  const { userId } = await auth()
  const clerkProfile = await currentUser()
  const usersCol = await users()
  
  let profileUser = await usersCol.findOne({
    $or: [{ username }, { name: username }]
  })

  // Fallback: if there is no Mongo user yet but we are viewing our own Clerk profile,
  // synthesize a minimal user document so the profile page still renders instead of 404.
  if (!profileUser && clerkProfile && (clerkProfile.username === username || clerkProfile.id === username)) {
    const now = new Date()
    profileUser = {
      _id: clerkProfile.id,
      clerkId: clerkProfile.id,
      email: clerkProfile.emailAddresses[0]?.emailAddress || "",
      name: clerkProfile.fullName || clerkProfile.username || "Unknown",
      image: clerkProfile.imageUrl,
      emailVerified: null,
      username: clerkProfile.username || undefined,
      passwordHash: undefined,
      displayName: clerkProfile.fullName || undefined,
      avatar: clerkProfile.imageUrl,
      bannerUrl: "",
      bio: "",
      statusNote: "",
      followersCount: 0,
      followingCount: 0,
      xp: 0,
      level: 1,
      rank: "Newbie",
      badges: [],
      articlesRead: 0,
      commentsCount: 0,
      likesGiven: 0,
      likesReceived: 0,
      role: "user",
      isVerified: false,
      verificationCode: undefined,
      verificationCodeExpiresAt: undefined,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    } as any
  }

  if (!profileUser) notFound()

  // Resolve Mantoric authority role (Caesar / Senator / Praetor / Gladiator / Newbie)
  let mantoricRole: MantoricRole = "Newbie"
  if (profileUser.clerkId) {
    if (clerkProfile && clerkProfile.id === profileUser.clerkId) {
      mantoricRole = await resolveMantoricRole(clerkProfile as any)
    } else {
      try {
        const client = await clerkClient()
        const cu = await client.users.getUser(profileUser.clerkId)
        mantoricRole = await resolveMantoricRole(cu)
      } catch {
        mantoricRole = "Newbie"
      }
    }
  }

  const role = mantoricRole as string
  const isProfileCaesar = profileUser.clerkId === CAESAR_CLERK_ID
  const isOwnProfile = userId && profileUser.clerkId === userId

  let isFollowing = false
  if (userId) {
    const followsCol = await follows()
    const existing = await followsCol.findOne({
      followerId: userId,
      followingId: profileUser._id.toString()
    })
    isFollowing = !!existing
  }

  // Fetch last 5 published articles by this user (by Clerk ID)
  const articlesCol = await articles()
  const recentArticles = profileUser.clerkId
    ? await articlesCol
        .find({ authorId: profileUser.clerkId, status: "published" })
        .sort({ publishedAt: -1 })
        .limit(5)
        .toArray()
    : []

  const profileContent = (
    <div className="space-y-10">
      <div className={`overflow-hidden rounded-xl border bg-card shadow-sm ${getAuraClass(role)}`}>
        {/* Hero Banner */}
        <div className="relative w-full h-[260px] sm:h-[300px] bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
          {profileUser.bannerUrl && (
            <Image
              src={profileUser.bannerUrl as string}
              alt="Profile banner"
              fill
              unoptimized
              priority
              className="object-cover"
            />
          )}
          
          {/* Settings / Edit Profile (Only for own profile) */}
          {isOwnProfile && (
            <div className="absolute right-4 top-4 flex gap-2">
              <Link
                href="/settings"
                className="hidden rounded-full bg-background/60 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-md transition-all hover:bg-background/80 sm:inline-flex items-center gap-1.5"
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Link>
              <EditProfileDialog
                username={profileUser.username || null}
                bio={profileUser.bio || null}
                bannerUrl={profileUser.bannerUrl || null}
                avatar={(profileUser.avatar || profileUser.image) as string | null}
              />
            </div>
          )}
        </div>
        
        <div className="relative px-4 pb-6 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5">
              <div
                className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-4 border-background bg-secondary sm:h-32 sm:w-32 ring-2 ${
                  role.toLowerCase() === "caesar"
                    ? "ring-[#ffd700]"
                    : role.toLowerCase() === "senator"
                    ? "ring-[#a855f7]"
                    : "ring-transparent"
                }`}
              >
                {profileUser.avatar || profileUser.image ? (
                  <img
                    src={(profileUser.avatar || profileUser.image) as string}
                    alt={profileUser.displayName || profileUser.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-4xl font-bold">
                    {profileUser.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <div className="mt-4 sm:mb-2 sm:mt-0">
                <div className="flex items-center gap-3">
                  <h1 className={`text-2xl font-bold sm:text-3xl ${isProfileCaesar ? "caesar-name" : "text-foreground"}`}>
                    {profileUser.displayName || profileUser.name}
                  </h1>
                  <Badge className={`mantoric-role-badge h-6 px-3 text-xs ${getRankColor(role)}`}>
                    {getRoleIcon(role)}
                    {role}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">@{profileUser.username || "username"}</p>
                {profileUser.statusNote && (
                  <p className="mt-2 text-sm italic text-muted-foreground">
                    "{profileUser.statusNote}"
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex gap-3 sm:mt-0 sm:pb-2">
              <FollowButton
                targetUserId={profileUser._id.toString()}
                initialIsFollowing={isFollowing}
                isOwnProfile={!!isOwnProfile}
              />
            </div>
          </div>
          
          <div className="mt-8 border-t border-border pt-6">
            <h2 className="text-lg font-semibold text-foreground">About</h2>
            <p className="mt-2 text-muted-foreground">
              {profileUser.bio || "No biography provided yet."}
            </p>
          </div>
          
          <div className="mt-8 flex gap-8 border-t border-border pt-6">
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground">{profileUser.followersCount || 0}</span>
              <span className="text-sm text-muted-foreground">Followers</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground">{profileUser.followingCount || 0}</span>
              <span className="text-sm text-muted-foreground">Following</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-foreground">{profileUser.xp || 0}</span>
              <span className="text-sm text-muted-foreground">XP</span>
            </div>
          </div>

          {recentArticles.length > 0 && (
            <div className="mt-10 border-t border-border pt-6">
              <h2 className="text-lg font-semibold text-foreground">
                Recent Articles
              </h2>
              <div className="mt-4 space-y-3">
                {recentArticles.map((article) => (
                  <Link
                    key={article._id.toString()}
                    href={`/article/${article.slug}`}
                    className="block rounded-lg border border-border/60 bg-secondary/40 px-4 py-3 text-sm transition-colors hover:bg-secondary hover:border-border"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-foreground line-clamp-1">
                        {article.title}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {article.readTime} min read
                      </span>
                    </div>
                    {article.excerpt && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <ThreeColumnLayout
      leftSidebar={<LeftSidebar />}
      rightSidebar={<RightSidebar />}
      mainContent={profileContent}
    />
  )
}
