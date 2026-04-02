"use client"

import { useState, useEffect } from "react"
import { Palette, Lock, Check, Sparkles, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Theme {
  id: string
  name: string
  colors: {
    primary: string
    accent: string
    gradient: string
  }
  unlockRequirement: {
    type: "respect" | "premium" | "rank"
    value: number | string | boolean
  }
  isUnlocked: boolean
  isActive: boolean
}

interface ThemeSelectorProps {
  respectPoints: number
  userRank: string
  isPremium: boolean
  currentTheme: string
}

const THEMES: Theme[] = [
  {
    id: "dark-purple",
    name: "Imperial Purple",
    colors: {
      primary: "#9333ea",
      accent: "#a855f7",
      gradient: "from-purple-600 via-purple-500 to-fuchsia-500"
    },
    unlockRequirement: { type: "respect", value: 0 },
    isUnlocked: true,
    isActive: false
  },
  {
    id: "emerald-stoic",
    name: "Stoic Emerald",
    colors: {
      primary: "#10b981",
      accent: "#34d399",
      gradient: "from-emerald-600 via-emerald-500 to-teal-500"
    },
    unlockRequirement: { type: "respect", value: 100 },
    isUnlocked: false,
    isActive: false
  },
  {
    id: "royal-gold",
    name: "Golden Wisdom",
    colors: {
      primary: "#f59e0b",
      accent: "#fbbf24",
      gradient: "from-amber-600 via-amber-500 to-yellow-500"
    },
    unlockRequirement: { type: "respect", value: 250 },
    isUnlocked: false,
    isActive: false
  },
  {
    id: "stellar-abyss",
    name: "Stellar Abyss (Visual)",
    colors: {
      primary: "#3b82f6",
      accent: "#60a5fa",
      gradient: "from-blue-900 via-black to-slate-900 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2000')] bg-cover"
    },
    unlockRequirement: { type: "premium", value: true },
    isUnlocked: false,
    isActive: false
  },
  {
    id: "classic-black",
    name: "Classic Black",
    colors: {
      primary: "#e5e5e5",
      accent: "#ffffff",
      gradient: "from-black via-zinc-900 to-black"
    },
    unlockRequirement: { type: "respect", value: 50 },
    isUnlocked: false,
    isActive: false
  },
  {
    id: "imperial-white",
    name: "Imperial White",
    colors: {
      primary: "#7e22ce",
      accent: "#9333ea",
      gradient: "from-white via-slate-100 to-white"
    },
    unlockRequirement: { type: "respect", value: 500 },
    isUnlocked: false,
    isActive: false
  }
]

export function ThemeSelector({ respectPoints = 0, userRank, isPremium, currentTheme }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [themes, setThemes] = useState<Theme[]>(THEMES)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTheme, setActiveTheme] = useState(currentTheme || "dark-purple")

  useEffect(() => {
    // Check unlock status for each theme
    const updatedThemes = THEMES.map(theme => {
      let isUnlocked = false

      switch (theme.unlockRequirement.type) {
        case "respect":
          isUnlocked = respectPoints >= (theme.unlockRequirement.value as number)
          break
        case "rank":
          isUnlocked = userRank === theme.unlockRequirement.value
          break
        case "premium":
          isUnlocked = isPremium
          break
      }

      return {
        ...theme,
        isUnlocked: theme.id === "dark-purple" ? true : isUnlocked,
        isActive: theme.id === activeTheme
      }
    })

    setThemes(updatedThemes)
  }, [respectPoints, userRank, isPremium, activeTheme])

  const handleActivate = async (themeId: string) => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const res = await fetch("/api/user/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId }),
      })

      if (res.ok) {
        setActiveTheme(themeId)
        toast.success("Theme activated!")
        // Reload to apply theme CSS variables
        window.location.reload()
      } else {
        const data = await res.json()
        toast.error(data.error || "Failed to activate theme")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getUnlockText = (theme: Theme) => {
    switch (theme.unlockRequirement.type) {
      case "respect":
        return `${theme.unlockRequirement.value} Respect required`
      case "rank":
        return `Requires ${theme.unlockRequirement.value} rank`
      case "premium":
        return "Premium only"
    }
  }

  const getProgress = (theme: Theme) => {
    if (theme.unlockRequirement.type === "respect") {
      const required = theme.unlockRequirement.value as number
      return Math.min(100, (respectPoints / required) * 100)
    }
    return 0
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="rounded-full gap-2"
      >
        <Palette className="h-4 w-4" />
        Theme
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Customize Your Imperium
            </DialogTitle>
            <DialogDescription>
              Unlock themes by earning valid respect, achieving ranks, or upgrading to Premium.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {themes.map(theme => (
              <div
                key={theme.id}
                className={cn(
                  "relative p-4 rounded-xl border-2 transition-all",
                  theme.isActive
                    ? "border-primary bg-primary/5"
                    : theme.isUnlocked
                    ? "border-border/50 bg-secondary/30 hover:border-border"
                    : "border-border/30 bg-secondary/10 opacity-70"
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Color Preview */}
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl bg-gradient-to-br shadow-inner",
                      theme.colors.gradient
                    )}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground">{theme.name}</h4>
                      {theme.isActive && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                          Active
                        </span>
                      )}
                    </div>

                    {theme.isUnlocked ? (
                      <p className="text-xs text-muted-foreground">Unlocked</p>
                    ) : (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          {getUnlockText(theme)}
                        </p>
                        {theme.unlockRequirement.type === "respect" && (
                          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                theme.colors.gradient
                              )}
                              style={{ width: `${getProgress(theme)}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {theme.isUnlocked ? (
                    <Button
                      onClick={() => handleActivate(theme.id)}
                      disabled={theme.isActive || isLoading}
                      size="sm"
                      className={cn(
                        "rounded-lg",
                        theme.isActive && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {theme.isActive ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Active
                        </>
                      ) : (
                        "Activate"
                      )}
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Premium badge */}
                {theme.unlockRequirement.type === "premium" && !theme.isUnlocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-xl">
                    <Button size="sm" className="gap-2 bg-gradient-to-r from-yellow-600 to-amber-500">
                      <Crown className="h-4 w-4" />
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border/30">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your Respect</span>
              <span className="font-bold text-foreground">{respectPoints.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-muted-foreground">Current Rank</span>
              <span className="font-bold text-foreground">{userRank}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
