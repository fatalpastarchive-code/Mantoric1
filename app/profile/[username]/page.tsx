import { notFound } from "next/navigation"
import Image from "next/image"
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server"
import { users, follows, articles } from "@/lib/db/collections"
import { Button } from "@/components/ui/button"
import { FollowButton } from "@/components/profile/follow-button"
import { EditProfileDialog } from "@/components/profile/edit-profile-dialog"
import { ProfileTabs } from "@/components/profile/profile-tabs"
import { ThreeColumnLayout } from "@/components/layout/three-column-layout"
import { LeftSidebar } from "@/components/sidebar/left-sidebar"
import { RightSidebar } from "@/components/sidebar/right-sidebar"
import { RespectWriterButton } from "@/components/respect/respect-writer-button"
import { 
  Settings, 
  Crown, 
  Landmark, 
  ShieldCheck, 
  Swords, 
  User as UserIcon, 
  Calendar, 
  MapPin, 
  Link as LinkIcon,
  Sparkles,
  Zap,
  Book,
  Film,
  Star,
  Search
} from "lucide-react"
import { calculateReputation } from "@/lib/db/schema"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CAESAR_CLERK_ID } from "@/lib/constants"
import { resolveMantoricRole, type MantoricRole } from "@/lib/auth/roles"
import { format } from "date-fns"
import { getUserCulturalReviews } from "@/lib/actions/cultural-review-actions"

function getRankColor(rank: string): string {
  const r = rank.toLowerCase()
  switch (r) {
    case "caesar": return "badge-caesar text-black"
    case "senator": return "badge-senator text-white"
    case "praetor": return "badge-praetor text-white"
    case "gladiator": return "badge-gladiator text-white"
    case "newbie": return "badge-newbie text-muted-foreground"
    default: return "bg-secondary text-muted-foreground"
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

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const { userId } = await auth()
  const clerkProfileOwner = await currentUser()
  const usersCol = await users()
  
  let profileUser = await usersCol.findOne({
    $or: [{ username }, { name: username }]
  })

  // Basic synthesized profile if viewing self but mongo not synced
  if (!profileUser && clerkProfileOwner && (clerkProfileOwner.username === username || clerkProfileOwner.id === username)) {
      const now = new Date()
      // ... synthesized data logic (trimmed for brevity but keeping it functional)
      profileUser = { clerkId: clerkProfileOwner.id, username: clerkProfileOwner.username, displayName: clerkProfileOwner.fullName, avatar: clerkProfileOwner.imageUrl, createdAt: now, xp: 0, followersCount: 0, followingCount: 0, rank: "Newbie" } as any
  }

  if (!profileUser) notFound()

  // Mantoric Role Check
  let mantoricRole: MantoricRole = "Newbie"
  if (profileUser.clerkId) {
    try {
      const client = await clerkClient()
      const cu = await client.users.getUser(profileUser.clerkId)
      mantoricRole = await resolveMantoricRole(cu)
    } catch {
      mantoricRole = "Newbie"
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

  // Fetch articles for feed
  const articlesCol = await articles()
  const userArticles = await articlesCol
    .find({ authorId: profileUser.clerkId || profileUser._id.toString(), status: "published" })
    .sort({ publishedAt: -1 })
    .toArray()

  // Enriched articles mapping to match ArticleCardProps
  const feedArticles = userArticles.map(a => ({
    id: String(a._id),
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt || "",
    imageUrl: a.imageUrl || "",
    category: a.category,
    likes: a.likesCount || 0,
    comments: a.commentsCount || 0,
    readTime: a.readTime || 1,
    createdAt: (a.publishedAt || a.createdAt).toISOString(),
    author: {
        id: profileUser!.clerkId || profileUser!._id.toString(),
        clerkId: profileUser!.clerkId,
        username: profileUser!.username,
        name: profileUser!.displayName || profileUser!.name || "Anonymous",
        avatar: profileUser!.avatar || profileUser!.image,
        rank: profileUser!.rank,
        xp: profileUser!.xp,
        bio: profileUser!.bio,
        isVerifiedExpert: (profileUser as any).isVerifiedExpert,
        expertField: (profileUser as any).expertField
    }
  }))

  const respectPoints = profileUser.respectPoints || 0
  const reputation = calculateReputation(respectPoints, profileUser.articlesRead || 0)
  const expertBadge = (profileUser as any).isVerifiedExpert ? { label: (profileUser as any).expertField || "Expert", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" } : null

  // Fetch cultural reviews from the proper collection
  const { reviews: culturalReviewsList = [] } = await getUserCulturalReviews(profileUser.clerkId || profileUser._id.toString())
  
  const mediaItems = culturalReviewsList.map(review => ({
    id: review._id,
    type: review.type.toLowerCase() as "book" | "movie" | "series",
    title: review.title,
    rating: review.rating,
    review: review.review,
    addedAt: new Date(review.createdAt),
    imageUrl: review.imageUrl,
    quote: review.quote
  }))

  const profileContent = (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Banner */}
      <div className="relative h-48 w-full bg-zinc-900 overflow-hidden">
        {profileUser.bannerUrl ? (
          <img src={profileUser.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-950 opacity-50" />
        )}
      </div>

      {/* Profile Info */}
      <div className="px-4 pb-4">
        <div className="relative flex justify-between items-start">
          {/* PP overlapping Banner */}
          <div className="relative -mt-16 sm:-mt-20">
             <div className="h-32 w-32 sm:h-36 sm:w-36 rounded-full border-4 border-background bg-zinc-800 overflow-hidden ring-1 ring-border/20 shadow-xl">
                {profileUser.avatar || profileUser.image ? (
                   <img src={(profileUser.avatar || profileUser.image) as string} alt={profileUser.displayName || 'PP'} className="h-full w-full object-cover" />
                ) : (
                   <div className="h-full w-full flex items-center justify-center text-5xl font-bold bg-zinc-800 text-zinc-600">
                      {(profileUser.displayName || profileUser.name || 'U').charAt(0)}
                   </div>
                )}
             </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex gap-2">
            {isOwnProfile ? (
              <div className="flex gap-2">
                 <EditProfileDialog 
                    username={profileUser.username || null} 
                    bio={profileUser.bio || null} 
                    bannerUrl={profileUser.bannerUrl || null} 
                    avatar={(profileUser.avatar || profileUser.image) as string | null}
                    trigger={
                      <Button variant="outline" className="rounded-full font-bold">
                        <Settings className="mr-2 h-4 w-4" />
                        Edit Profile
                      </Button>
                    }
                 />
              </div>
            ) : (
              <>
                {profileUser.clerkId && (
                  <RespectWriterButton targetUserId={profileUser.clerkId} />
                )}
                <FollowButton 
                  targetUserId={profileUser._id.toString()} 
                  initialIsFollowing={isFollowing} 
                  isOwnProfile={false}
                />
              </>
            )}
          </div>
        </div>

        {/* Identity & Bio */}
        <div className="mt-4 space-y-1">
           <div className="flex items-center gap-2">
             <h1 className={`text-xl font-extrabold tracking-tight sm:text-2xl ${isProfileCaesar ? "caesar-name" : "text-foreground"}`}>
               {profileUser.displayName || profileUser.name}
             </h1>
             {expertBadge && (
               <Badge className={`h-5 px-2 text-[10px] font-bold border ${expertBadge.color}`}>
                 <ShieldCheck className="h-3 w-3 mr-1" />
                 {expertBadge.label}
               </Badge>
             )}
           </div>
           <div className="flex items-center gap-2">
             <p className="text-zinc-500 text-sm font-medium">@{profileUser.username || "username"}</p>
             <Badge className={`mantoric-role-badge h-5 px-2 text-[10px] ${getRankColor(role)}`}>
               {getRoleIcon(role)}
               {role}
             </Badge>
           </div>
        </div>

        {profileUser.bio && (
          <p className="mt-3 text-sm sm:text-[15px] leading-normal text-foreground/90 whitespace-pre-wrap">
            {profileUser.bio}
          </p>
        )}

        {/* Stats Showcase Card */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
           <div className="p-3 rounded-2xl bg-secondary/20 border border-border/30 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                 <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Respect</span>
              </div>
              <span className="text-lg font-black text-foreground">{respectPoints.toLocaleString()}</span>
           </div>
           <div className="p-3 rounded-2xl bg-secondary/20 border border-border/30 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                 <Zap className="h-3.5 w-3.5 text-yellow-500" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Streak</span>
              </div>
              <span className="text-lg font-black text-foreground">{(profileUser as any).streak || 0} Days</span>
           </div>
           <div className="p-3 rounded-2xl bg-secondary/20 border border-border/30 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                 <Crown className="h-3.5 w-3.5 text-emerald-500" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Reputation</span>
              </div>
              <span className="text-lg font-black text-foreground">{reputation.toLocaleString()}</span>
           </div>
           <div className="p-3 rounded-2xl bg-secondary/20 border border-border/30 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                 <Book className="h-3.5 w-3.5 text-blue-500" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Treatises</span>
              </div>
              <span className="text-lg font-black text-foreground">{userArticles.length}</span>
           </div>
        </div>

        {/* User Metadata */}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-500 font-medium">
           <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Joined {format(new Date(profileUser.createdAt), "MMMM yyyy")}</span>
           </div>
        </div>

        {/* Followers / Following Stats */}
        <div className="mt-4 flex gap-5 text-sm">
           <div className="flex items-center gap-1">
              <span className="font-bold text-foreground">{profileUser.followingCount || 0}</span> <span className="text-zinc-500 font-medium">Following</span>
           </div>
           <div className="flex items-center gap-1">
              <span className="font-bold text-foreground">{profileUser.followersCount || 0}</span> <span className="text-zinc-500 font-medium">Followers</span>
           </div>
        </div>
      </div>

      {/* Tabs with Culture Integration */}
      <ProfileTabs 
        userId={profileUser.clerkId || profileUser._id.toString()}
        isOwnProfile={!!isOwnProfile}
        authorName={profileUser.displayName || profileUser.name || "Anonymous"}
        articles={feedArticles as any}
        initialMedia={mediaItems as any}
      />
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
