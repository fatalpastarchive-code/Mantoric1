"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type Status = {
  canGiveRespect: boolean
  daysRemaining: number
}

export function RespectWriterButton({ targetUserId, className }: { targetUserId: string; className?: string }) {
  const { isSignedIn } = useUser()
  const [status, setStatus] = useState<Status | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!isSignedIn) {
        setStatus({ canGiveRespect: false, daysRemaining: 0 })
        return
      }
      try {
        const res = await fetch(`/api/user/${targetUserId}/respect`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setStatus({
          canGiveRespect: !!data.canGiveRespect,
          daysRemaining: data.daysRemaining || 0,
        })
      } catch {
        // ignore
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [isSignedIn, targetUserId])

  const isDisabled = !isSignedIn || !status?.canGiveRespect

  const daysRemaining = status?.daysRemaining || 0

  const tooltip = !isSignedIn
    ? "Sign in to give Respect"
    : !status?.canGiveRespect
      ? `Cooldown: ${daysRemaining} days remaining. You can give Respect once every 30 days.`
      : "You can give Respect once every 30 days."

  const buttonLabel = !isSignedIn
    ? "Respect Writer"
    : status?.canGiveRespect
      ? "Respect Writer"
      : "Respect Given"

  const handleClick = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to give Respect")
      return
    }
    if (!status?.canGiveRespect) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/user/${targetUserId}/respect`, { method: "POST" })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data?.error || "Unable to give Respect")
        if (typeof data?.daysRemaining === "number") {
          setStatus({ canGiveRespect: false, daysRemaining: data.daysRemaining })
        }
        return
      }

      toast.success("New Respect Earned!")
      setStatus({ canGiveRespect: false, daysRemaining: 30 })
    } catch {
      toast.error("Unable to give Respect")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled || isLoading}
      title={tooltip}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-black uppercase tracking-widest transition-all",
        isDisabled
          ? "bg-secondary/30 text-muted-foreground opacity-70 cursor-not-allowed"
          : "bg-purple-500/15 text-purple-300 hover:bg-purple-500/25",
        className
      )}
    >
      <Sparkles className="h-4 w-4" />
      <span>{buttonLabel}</span>
    </button>
  )
}
