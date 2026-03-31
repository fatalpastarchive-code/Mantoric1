"use client"

import { useState } from "react"
import { ShieldCheck } from "lucide-react"
import { handleRespectAction } from "@/lib/actions/forum-actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ForumRespectButtonProps {
  authorId: string
  initialRespects?: number
}

export function ForumRespectButton({ authorId, initialRespects = 0 }: ForumRespectButtonProps) {
  const [respects, setRespects] = useState(initialRespects)
  const [hasRespected, setHasRespected] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRespect = async () => {
    if (hasRespected || isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const res = await handleRespectAction(authorId)
      if (res.success) {
        setRespects(prev => prev + 1)
        setHasRespected(true)
        toast.success("Respect given")
      } else {
        toast.error(res.error || "Failed to give respect")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      onClick={handleRespect}
      disabled={hasRespected || isSubmitting}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl transition-all border",
        hasRespected 
          ? "bg-purple-500/10 border-purple-500/30 text-purple-400" 
          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-purple-400 hover:border-purple-500/30"
      )}
    >
      <ShieldCheck className={cn("h-4 w-4", hasRespected && "fill-purple-500/20")} />
      <span className="text-sm font-bold">{respects} Respect</span>
    </button>
  )
}
