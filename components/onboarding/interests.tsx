"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

const INTERESTS = [
  { id: "philosophy", label: "Philosophy", icon: "🏛️" },
  { id: "finance", label: "Finance", icon: "💰" },
  { id: "technology", label: "Technology", icon: "💻" },
  { id: "fitness", label: "Fitness", icon: "💪" },
  { id: "self-improvement", label: "Self Improvement", icon: "🌱" },
  { id: "science", label: "Science", icon: "🔬" },
  { id: "art", label: "Art", icon: "🎨" },
  { id: "history", label: "History", icon: "📜" },
]

export function OnboardingInterests() {
  const [selected, setSelected] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const toggleInterest = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleFinish = async () => {
    if (selected.length < 3) {
      toast.error("Please select at least 3 interests to personalize your feed.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interests: selected }),
      })

      if (res.ok) {
        toast.success("Welcome to Mantoric! Your feed is ready.")
        router.push("/")
      } else {
        toast.error("Failed to save interests.")
      }
    } catch (e) {
      toast.error("An error occurred.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 text-center">
      <div className="mb-8">
        <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl mb-2">
          Personalize Your Imperium
        </h1>
        <p className="text-muted-foreground">
          Select at least 3 domains of knowledge to shape your intellectual feed.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {INTERESTS.map((interest) => (
          <button
            key={interest.id}
            onClick={() => toggleInterest(interest.id)}
            className={`relative p-4 rounded-2xl border-2 transition-all group ${
              selected.includes(interest.id)
                ? "border-primary bg-primary/10"
                : "border-border/30 bg-secondary/20 hover:border-border"
            }`}
          >
            <span className="text-2xl mb-2 block">{interest.icon}</span>
            <span className={`text-sm font-bold ${selected.includes(interest.id) ? "text-primary" : "text-muted-foreground"}`}>
              {interest.label}
            </span>
            {selected.includes(interest.id) && (
              <div className="absolute top-2 right-2 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
          </button>
        ))}
      </div>

      <Button
        onClick={handleFinish}
        disabled={selected.length < 3 || isLoading}
        className="w-full sm:w-64 h-12 rounded-full font-black text-lg shadow-xl shadow-primary/20 transition-transform active:scale-95"
      >
        {isLoading ? "Preparing Feed..." : "Enter the Forum"}
      </Button>
    </div>
  )
}
