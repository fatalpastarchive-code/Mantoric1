"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function RespectNotification() {
  const { isSignedIn, user } = useUser()
  const [lastCheckedAt, setLastCheckedAt] = useState(new Date())

  useEffect(() => {
    if (!isSignedIn) return

    const checkNewRespect = async () => {
      try {
        const res = await fetch("/api/respect/notify")
        if (res.ok) {
          const data = await res.json()
          if (data.notifications && data.notifications.length > 0) {
            data.notifications.forEach((notif: any) => {
              // Only show if it's newer than our last check
              const notifDate = new Date(notif.createdAt)
              if (notifDate > lastCheckedAt) {
                toast.custom((t) => (
                  <div className="bg-black/90 backdrop-blur-xl border border-purple-500/30 p-4 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="p-2 rounded-full bg-purple-500/20">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-white">New Respect Earned!</span>
                      <span className="text-xs text-muted-foreground">A scholar has recognized your treatise.</span>
                    </div>
                    <button onClick={() => toast.dismiss(t)} className="ml-auto text-muted-foreground hover:text-white transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ), { duration: 5000, position: "top-right" })
              }
            })
            setLastCheckedAt(new Date())
          }
        }
      } catch (error) {
        console.error("Failed to check respect notifications:", error)
      }
    }

    const interval = setInterval(checkNewRespect, 15000) // Check every 15 seconds
    return () => clearInterval(interval)
  }, [isSignedIn, lastCheckedAt])

  return null
}
