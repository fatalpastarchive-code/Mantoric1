"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useUser, SignInButton } from "@clerk/nextjs"
import { PenLine, Heart, Sparkles, Dumbbell, Wallet, Brain, Cpu, Coffee, Gift, Lock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CATEGORIES, CAESAR_CLERK_ID } from "@/lib/constants"

const categoryIcons: Record<string, React.ElementType> = {
  "self-improvement": Sparkles,
  "fitness": Dumbbell,
  "finance": Wallet,
  "relationships": Heart,
  "philosophy": Brain,
  "technology": Cpu,
  "lifestyle": Coffee,
}

export function ArticleComposer() {
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const [title, setTitle] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showDonationDialog, setShowDonationDialog] = useState(false)

  const showCategories = title.length > 0

  const handleCreate = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!title.trim() || !selectedCategory) return

    const rawRole = user?.publicMetadata?.role?.toString() || "User"
    const role = rawRole.toLowerCase()
    const isCaesar = user?.id === CAESAR_CLERK_ID

    // Caesar, Senator, or Praetor can go to the publish page
    const allowedRoles = ["caesar", "senator", "praetor"]
    if (isCaesar || allowedRoles.includes(role)) {
      // Find the category label to pass to publish
      const category = CATEGORIES.find((c) => c.id === selectedCategory)
      const params = new URLSearchParams()
      params.set("title", title.trim())
      // Use the category ID as the value for the search param to match the select field in PublishForm
      if (category) params.set("category", category.label) 
      
      router.push(`/publish?${params.toString()}`)
      return
    }

    // Others still see the donation / coming soon dialog
    setShowDonationDialog(true)
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-between overflow-hidden rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Have something to share?</p>
            <p className="text-xs text-muted-foreground">Sign in to publish articles and join discussions.</p>
          </div>
        </div>
        <SignInButton mode="modal">
          <button className="rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-background transition-all hover:bg-foreground/90">
            Sign in
          </button>
        </SignInButton>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
        <form onSubmit={handleCreate} className="flex items-center gap-3 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent">
            <PenLine className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Share your knowledge with the community..."
            className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          <Button
            type="submit"
            disabled={!title.trim() || !selectedCategory}
            className="rounded-lg bg-foreground px-5 py-2 text-sm font-bold text-background transition-all hover:bg-foreground/90 disabled:opacity-50"
          >
            Create
          </Button>
        </form>

        {/* Category Selector with Animation */}
        <div
          className={cn(
            "grid transition-all duration-300 ease-out",
            showCategories ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="border-t border-border/50 px-3 py-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Select Category
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => {
                  const Icon = categoryIcons[category.id] || Sparkles
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200",
                        selectedCategory === category.id
                          ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                          : "border-border/50 bg-secondary/50 text-muted-foreground hover:border-border hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {category.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Dialog */}
      <Dialog open={showDonationDialog} onOpenChange={setShowDonationDialog}>
        <DialogContent className="border-emerald-500/20 bg-gradient-to-br from-card via-card to-emerald-950/20 sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500">
              <Gift className="h-8 w-8 text-white" />
            </div>
            <DialogTitle className="font-heading text-2xl font-bold text-foreground">
              Unlock Publishing
            </DialogTitle>
            <DialogDescription className="mt-2 text-base text-muted-foreground">
              Your donation helps us bring the publishing feature to all users. Support our community and be among the first to share your knowledge!
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-400">What your donation unlocks:</p>
                <ul className="mt-2 space-y-1.5 text-sm text-emerald-300/80">
                  <li>- Publishing feature for all community members</li>
                  <li>- Earn XP for every like and comment</li>
                  <li>- Climb the leaderboard ranks</li>
                  <li>- Build your reputation as a creator</li>
                  <li>- Help others on their journey</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-teal-500/20 bg-teal-500/10 p-4">
            <p className="text-center text-sm text-teal-300">
              Every contribution brings us closer to making this feature available for everyone in the community.
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-base font-bold text-white transition-all hover:from-emerald-600 hover:to-teal-600"
            >
              Donate & Unlock Publishing
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDonationDialog(false)}
              className="w-full text-muted-foreground hover:text-foreground"
            >
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
