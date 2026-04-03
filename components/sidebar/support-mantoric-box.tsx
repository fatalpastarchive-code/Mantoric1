"use client"

import { useState, useEffect } from "react"
import { Heart, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { incrementSupportViews, incrementSupportYes, incrementSupportNo } from "@/lib/actions/support-actions"
import { toast } from "sonner"

interface SupportMantoricBoxProps {
  className?: string
}

export function SupportMantoricBox({ className }: SupportMantoricBoxProps) {
  const [voted, setVoted] = useState(false)

  useEffect(() => {
    incrementSupportViews()
  }, [])

  const handleVote = async (yes: boolean) => {
    if (voted) return
    
    setVoted(true)
    if (yes) {
      await incrementSupportYes()
      toast.success("Thank you for your intent!")
    } else {
      await incrementSupportNo()
      toast.info("Understood. Thank you for your feedback.")
    }
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-card/50 border border-border/50 p-4 backdrop-blur-sm",
      className
    )}>
      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="h-3.5 w-3.5 text-purple-400" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
            Support Mantoric
          </h3>
        </div>

        <p className="text-xs font-bold text-foreground leading-snug pr-4">
          Would you contribute to Mantoric&apos;s independent growth? (min. 10$)
        </p>

        {!voted ? (
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleVote(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 font-black text-[10px] uppercase transition-all shadow-lg"
            >
              <Check className="h-3 w-3" />
              Yes
            </button>
            <button
              onClick={() => handleVote(false)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-muted hover:bg-accent text-muted-foreground hover:text-foreground font-black text-[10px] uppercase border border-border transition-all"
            >
              <X className="h-3 w-3" />
              No
            </button>
          </div>
        ) : (
          <div className="py-2 text-center rounded-xl bg-purple-500/5 border border-purple-500/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-purple-400">
              Voted. Thank you!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
