"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, SignInButton } from "@clerk/nextjs"
import { 
  PenLine, Heart, Sparkles, Dumbbell, Wallet, 
  Brain, Cpu, Coffee, Gift, Lock, VenetianMask, ShieldAlert 
} from "lucide-react"
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
import { getBrotherhoodStatus } from "@/lib/actions/support-intent-actions"

const categoryIcons: Record<string, React.ElementType> = {
  "self-improvement": Sparkles,
  "fitness": Dumbbell,
  "finance": Wallet,
  "relationships": Heart,
  "philosophy": Brain,
  "technology": Cpu,
  "psychology": VenetianMask,
  "lifestyle": Coffee,
}

export function ArticleComposer() {
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const [title, setTitle] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showDonationDialog, setShowDonationDialog] = useState(false)
  const [isBanned, setIsBanned] = useState(false)

  useEffect(() => {
    async function checkBan() {
      const { isPostBanned } = await getBrotherhoodStatus()
      setIsBanned(isPostBanned)
    }
    if (isSignedIn) checkBan()
  }, [isSignedIn])

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
      <div className="flex items-center justify-between overflow-hidden rounded-3xl bg-white/5 p-6 backdrop-blur-md border-none">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5">
            <Lock className="h-6 w-6 text-zinc-500" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">Have something to share?</p>
            <p className="text-sm text-zinc-500 font-light">Sign in to publish articles and join discussions.</p>
          </div>
        </div>
        <SignInButton mode="modal">
          <button className="rounded-2xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-zinc-200">
            Sign in
          </button>
        </SignInButton>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl bg-white/5 backdrop-blur-md border-none">
        <form onSubmit={handleCreate} className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5">
            <PenLine className="h-6 w-6 text-zinc-500" />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Share your knowledge..."
            className="flex-1 bg-transparent text-lg font-light text-foreground placeholder:text-zinc-600 focus:outline-none"
          />
          {isBanned ? (
            <div className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest">
              <ShieldAlert className="h-4 w-4" />
              Silenced
            </div>
          ) : (
            <Button
              type="submit"
              disabled={!title.trim() || !selectedCategory}
              className="rounded-2xl bg-white px-6 py-2.5 text-sm font-semibold text-black transition-all hover:bg-zinc-200 disabled:opacity-30 border-none"
            >
              Create
            </Button>
          )}
        </form>

        {/* Category Selector with Animation */}
        <div
          className={cn(
            "grid transition-all duration-500 ease-out",
            showCategories ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="px-4 pb-6 pt-2">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
                Select Category
              </p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => {
                  const Icon = categoryIcons[category.id] || Sparkles
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setSelectedCategory(category.id)}
                      className={cn(
                        "flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold transition-all duration-300",
                        selectedCategory === category.id
                          ? "bg-white text-black"
                          : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white font-light"
                      )}
                    >
                      <Icon className="h-4 w-4" />
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
