"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { UserPlus, UserMinus } from "lucide-react"

export function FollowButton({
  targetUserId,
  initialIsFollowing,
  isOwnProfile,
}: {
  targetUserId: string
  initialIsFollowing: boolean
  isOwnProfile?: boolean
}) {
  const { isSignedIn, user } = useUser()
  const router = useRouter()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)

  // Don't show button on your own profile
  if (isOwnProfile) {
    return (
      <button className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground opacity-50 cursor-not-allowed">
        Edit Profile
      </button>
    )
  }

  const handleFollow = async () => {
    if (!isSignedIn) {
      alert("Please sign in to follow users.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      })
      const data = await res.json()
      if (res.ok) {
        setIsFollowing(data.isFollowing)
        router.refresh()
      }
    } catch (error) {
      console.error("Follow error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleFollow}
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-bold transition-all disabled:opacity-50 ${
        isFollowing
          ? "border border-border bg-secondary/50 text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
          : "bg-foreground text-background hover:bg-foreground/90"
      }`}
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          <span>Unfollow</span>
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          <span>Follow</span>
        </>
      )}
    </button>
  )
}
