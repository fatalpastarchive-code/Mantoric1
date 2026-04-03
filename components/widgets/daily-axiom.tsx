"use client"

import { useEffect, useState } from "react"
import { Sparkles, TrendingUp, Info } from "lucide-react"
import { cn } from "@/lib/utils"

import { useUser } from "@clerk/nextjs"

interface Axiom {
  text: string
  author: string
  category: string
}

const AXIOMS: Axiom[] = [
  // Philosophy
  { text: "The unexamined life is not worth living.", author: "Socrates", category: "philosophy" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius", category: "philosophy" },
  { text: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", category: "philosophy" },
  { text: "Man is condemned to be free.", author: "Jean-Paul Sartre", category: "philosophy" },
  { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates", category: "philosophy" },
  { text: "We suffer more often in imagination than in reality.", author: "Seneca", category: "philosophy" },
  { text: "Happiness depends upon ourselves.", author: "Aristotle", category: "philosophy" },
  { text: "Act only according to maxims you can will as universal law.", author: "Immanuel Kant", category: "philosophy" },
  // Finance & Business
  { text: "Compound interest is the eighth wonder of the world.", author: "Albert Einstein", category: "finance" },
  { text: "The best way to predict the future is to create it.", author: "Peter Drucker", category: "business" },
  { text: "Price is what you pay. Value is what you get.", author: "Warren Buffett", category: "finance" },
  { text: "Be fearful when others are greedy, and greedy when others are fearful.", author: "Warren Buffett", category: "finance" },
  { text: "The stock market is designed to transfer money from the Active to the Patient.", author: "Warren Buffett", category: "finance" },
  { text: "In investing, what is comfortable is rarely profitable.", author: "Robert Arnott", category: "finance" },
  { text: "The most dangerous poison is the feeling of achievement.", author: "Sergey Brin", category: "business" },
  // Self-Improvement
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "self-improvement" },
  { text: "Discipline equals freedom.", author: "Jocko Willink", category: "self-improvement" },
  { text: "Your net worth to the world is determined by what remains after your bad habits are subtracted.", author: "Benjamin Franklin", category: "self-improvement" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier", category: "self-improvement" },
  { text: "The man who moves a mountain begins by carrying away small stones.", author: "Confucius", category: "self-improvement" },
  { text: "Quality is not an act, it is a habit.", author: "Aristotle", category: "self-improvement" },
  { text: "What we think, we become.", author: "Buddha", category: "self-improvement" },
  // Technology & Science
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke", category: "technology" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "technology" },
  { text: "Software is eating the world.", author: "Marc Andreessen", category: "technology" },
  { text: "The art of debugging is figuring out what you really told your computer to do.", author: "Andrew Singer", category: "technology" },
  // Relationships
  { text: "The quality of your life is the quality of your relationships.", author: "Tony Robbins", category: "relationships" },
  { text: "People will forget what you said, but never how you made them feel.", author: "Maya Angelou", category: "relationships" },
  // Lifestyle
  { text: "Less is more.", author: "Ludwig Mies van der Rohe", category: "lifestyle" },
  { text: "The things you own end up owning you.", author: "Chuck Palahniuk", category: "lifestyle" },
]

export function DailyAxiom() {
  const [axiom, setAxiom] = useState<Axiom | null>(null)
  const { isSignedIn } = useUser()

  useEffect(() => {
    const today = new Date().toDateString()
    const index = Math.abs(today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % AXIOMS.length
    setAxiom(AXIOMS[index])

    if (isSignedIn) {
      fetch("/api/user/streak", { method: "POST" })
        .catch(err => console.error("Failed to update streak:", err))
    }
  }, [isSignedIn])

  if (!axiom) return null

  return (
    <div className={cn("bg-card rounded-3xl p-6 border border-border/30 shadow-2xl relative overflow-hidden", className)}>
      <div className="flex items-center gap-3 mb-3">
        <Sparkles className="h-4 w-4 text-yellow-500 fill-yellow-500/20" />
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Daily Axiom</span>
      </div>
      <p className="text-[14px] font-bold leading-snug text-foreground tracking-tight mb-3 italic">
        "{axiom.text}"
      </p>
      <div className="flex items-center justify-between border-t border-border/30 pt-2">
        <span className="text-xs text-muted-foreground font-medium">— {axiom.author}</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-bold uppercase tracking-widest border border-border/30">
          {axiom.category}
        </span>
      </div>
    </div>
  )
}
