"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { recordDonationInteraction, getBrotherhoodStatus } from "@/lib/actions/support-intent-actions"
import { toast } from "sonner"
import { Check, Heart, Shield, ArrowRight } from "lucide-react"

interface SupportIntentBoxProps {
  className?: string
}

export function SupportIntentBox({ className }: SupportIntentBoxProps) {
  const [step, setStep] = useState<"QUESTION" | "NO_PATH" | "SLIDER" | "THANKS">("QUESTION")
  const [amount, setAmount] = useState(50)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [hasInteracted, setHasInteracted] = useState<boolean | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function checkStatus() {
      const { hasInteracted: status } = await getBrotherhoodStatus()
      setHasInteracted(status)
    }
    checkStatus()
  }, [])

  const getTierFromAmount = (val: number) => {
    if (val <= 20) return { label: "Supporter", color: "#34d399" }
    if (val <= 100) return { label: "Scholar", color: "#6ee7b7" }
    if (val <= 500) return { label: "Patron", color: "#a7f3d0" }
    return { label: "Founder's Circle", color: "#d1fae5" }
  }

  const tier = getTierFromAmount(amount)
  const percentage = ((amount - 0) / (1000 - 0)) * 100

  const updateAmount = useCallback((clientX: number) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    const ratio = x / rect.width
    const value = Math.round(ratio * 1000)
    setAmount(Math.max(1, Math.min(1000, value)))
  }, [])

  useEffect(() => {
    if (!isDragging) return
    const handleMouseMove = (e: MouseEvent) => updateAmount(e.clientX)
    const handleMouseUp = () => setIsDragging(false)
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, updateAmount])

  const handleDecision = async (choice: "YES" | "NO") => {
    if (choice === "NO") {
      setStep("NO_PATH")
      await recordDonationInteraction("NO")
      setTimeout(() => setHasInteracted(true), 10000)
    } else {
      setStep("SLIDER")
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const res = await recordDonationInteraction("YES", amount)
      if (res.success) {
        setStep("THANKS")
        toast.success("Loyalty recorded. 'Early Supporter' badge granted.")
        setTimeout(() => setHasInteracted(true), 10000)
      }
    } catch {
      toast.error("Process failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If already interacted, don't render anything
  if (hasInteracted === true || hasInteracted === null) {
     if (hasInteracted === null) return <div className="h-40 rounded-3xl bg-zinc-900/10 animate-pulse" />
     return null
  }

  return (
    <div className={cn("bg-black rounded-3xl p-6 border border-emerald-900/20 shadow-2xl relative overflow-hidden", className)}>
      {/* Background Micro-Glow: purple + green */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 blur-3xl -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-28 h-28 bg-emerald-500/5 blur-3xl translate-y-10 -translate-x-10" />

      {/* Step 1: The Question */}
      {step === "QUESTION" && (
        <div className="space-y-6">
          <div className="space-y-1">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/30 flex items-center justify-center mb-3">
               <Shield className="h-4 w-4 text-emerald-400" />
            </div>
            <h3 className="text-[17px] font-bold text-white leading-tight" style={{ fontFamily: "var(--font-cormorant), serif" }}>
              Would you like to support the evolution of Mantoric for your brothers?
            </h3>
            <p className="text-[11px] text-zinc-500 font-medium tracking-wide">
              Founding allies shape the trajectory of our Legion.
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => handleDecision("YES")}
              className="flex-1 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #059669, #10b981, #34d399)" }}
            >
              YES
            </button>
            <button 
              onClick={() => handleDecision("NO")}
              className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-400 text-xs font-black uppercase tracking-widest hover:text-white transition-colors border border-zinc-800"
            >
              NO
            </button>
          </div>
        </div>
      )}

      {/* Step 2: The No Path */}
      {step === "NO_PATH" && (
        <div className="py-8 space-y-4 text-center">
           <div className="flex justify-center">
             <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
               <ArrowRight className="h-4 w-4 text-zinc-600" />
             </div>
           </div>
           <p className="text-sm text-zinc-400 leading-relaxed italic" style={{ fontFamily: "var(--font-cormorant), serif" }}>
             "Wisdom requires foundations. We hope you find your path, brother."
           </p>
           <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.2em]">Transmission Closed</p>
        </div>
      )}

      {/* Step 3: The Slider */}
      {step === "SLIDER" && (
        <div className="space-y-6">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white tabular-nums">${amount}</span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Intent</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: tier.color }}>
              {tier.label}
            </span>
          </div>

          <div 
            ref={trackRef}
            className="relative h-1 bg-zinc-900 rounded-full cursor-pointer"
            onMouseDown={(e) => { setIsDragging(true); updateAmount(e.clientX) }}
          >
            <div 
              className="absolute h-full rounded-full transition-none"
              style={{ width: `${percentage}%`, background: `linear-gradient(90deg, #059669, ${tier.color})` }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              style={{ left: `${percentage}%` }}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl text-white text-xs font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}
          >
            {isSubmitting ? "TRANSMITTING..." : "COMMAND LOYALTY"}
          </button>
        </div>
      )}

      {/* Step 4: Final Thanks */}
      {step === "THANKS" && (
        <div className="py-6 space-y-4 text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Heart className="h-6 w-6 text-emerald-400 fill-emerald-400/20" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white uppercase tracking-tighter">Your loyalty is recorded in the archives.</h3>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">The 'Early Supporter' badge has been inscribed into your lineage.</p>
        </div>
      )}
    </div>
  )
}
