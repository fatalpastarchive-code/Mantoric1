"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Link2, Check, Crown, Shield, Sword, GraduationCap, Baby } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface DiscordIntegrationProps {
  userId: string
}

interface DiscordStatus {
  reputation: number
  eligibleRole: string
  currentRole: string | null
  discordLinked: boolean
  thresholds: Record<string, { name: string; minRep: number }>
  nextRole: { name: string; needed: number } | null
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  "Novice": <Baby className="h-4 w-4" />,
  "Scholar": <GraduationCap className="h-4 w-4" />,
  "Praetor": <Shield className="h-4 w-4" />,
  "Senator": <Sword className="h-4 w-4" />,
  "Imperial": <Crown className="h-4 w-4" />
}

const ROLE_COLORS: Record<string, string> = {
  "Novice": "bg-gray-500/10 text-gray-400 border-gray-500/20",
  "Scholar": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Praetor": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Senator": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "Imperial": "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
}

export function DiscordIntegration({ userId }: DiscordIntegrationProps) {
  const [status, setStatus] = useState<DiscordStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLinking, setIsLinking] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [userId])

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/discord/role")
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
      }
    } catch (error) {
      console.error("Failed to fetch Discord status", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLinkDiscord = async () => {
    setIsLinking(true)
    try {
      // In a real implementation, this would open Discord OAuth
      // For now, simulate with a mock Discord user ID
      const mockDiscordId = `discord_${Date.now()}`
      
      const res = await fetch("/api/discord/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discordUserId: mockDiscordId,
          discordAccessToken: "mock_token"
        }),
      })

      if (res.ok) {
        const data = await res.json()
        toast.success(data.message)
        fetchStatus()
      } else {
        toast.error("Failed to link Discord")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLinking(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl bg-secondary/20 border border-border/30 animate-pulse">
        <div className="h-6 w-48 bg-secondary rounded mb-4" />
        <div className="h-4 w-32 bg-secondary rounded" />
      </div>
    )
  }

  if (!status) {
    return null
  }

  const currentRoleStyle = ROLE_COLORS[status.eligibleRole] || ROLE_COLORS["Novice"]
  const CurrentIcon = ROLE_ICONS[status.eligibleRole] || ROLE_ICONS["Novice"]

  return (
    <div className="p-6 rounded-2xl bg-secondary/20 border border-border/30 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#5865F2]/10 text-[#5865F2]">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Discord Integration</h3>
            <p className="text-xs text-muted-foreground">
              Link your account for automatic role assignment
            </p>
          </div>
        </div>
        
        {status.discordLinked ? (
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <Check className="h-4 w-4" />
            Linked
          </div>
        ) : (
          <Button
            onClick={handleLinkDiscord}
            disabled={isLinking}
            size="sm"
            className="gap-2 bg-[#5865F2] hover:bg-[#4752C4]"
          >
            <Link2 className="h-4 w-4" />
            {isLinking ? "Linking..." : "Link Discord"}
          </Button>
        )}
      </div>

      {/* Current Role Display */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/30">
        <div className={cn("p-3 rounded-xl border", currentRoleStyle)}>
          {CurrentIcon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Rank</p>
          <p className="text-lg font-black">{status.eligibleRole}</p>
          <p className="text-xs text-muted-foreground">
            Based on {status.reputation} reputation
          </p>
        </div>
      </div>

      {/* Progress to Next Role */}
      {status.nextRole && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next Rank</span>
            <span className="font-medium">{status.nextRole.name}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{status.reputation} rep</span>
            <span className="text-muted-foreground">
              Need {status.nextRole.needed} more
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all"
              style={{
                width: `${Math.min(100, (status.reputation / (status.reputation + status.nextRole.needed)) * 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Role Hierarchy */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Rank Hierarchy</p>
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(status.thresholds).map(([key, role]) => {
            const isActive = status.eligibleRole === role.name
            const isPast = status.reputation >= role.minRep && !isActive
            
            return (
              <div
                key={key}
                className={cn(
                  "text-center p-2 rounded-lg border transition-all",
                  isActive 
                    ? ROLE_COLORS[role.name]
                    : isPast
                    ? "bg-secondary/30 border-border/30 opacity-60"
                    : "bg-secondary/10 border-border/20 opacity-40"
                )}
              >
                <div className="flex justify-center mb-1">
                  {ROLE_ICONS[role.name]}
                </div>
                <p className="text-[10px] font-bold">{role.name}</p>
                <p className="text-[9px] text-muted-foreground">{role.minRep}+</p>
              </div>
            )
          })}
        </div>
      </div>

      {status.discordLinked && status.currentRole !== status.eligibleRole && (
        <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-sm">
          <p className="text-yellow-400">
            Your Discord role needs updating! Click to sync to {status.eligibleRole}.
          </p>
        </div>
      )}
    </div>
  )
}
