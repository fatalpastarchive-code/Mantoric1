"use client"

import { useState } from "react"
import { Crown, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { recordSupportIntent } from "@/lib/actions/support-intent-actions"
import { toast } from "sonner"

interface SupportInterestBoxProps {
  className?: string
}

export function SupportInterestBox({ className }: SupportInterestBoxProps) {
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const amounts = [
    { value: "3", label: "3$", desc: "Supporter" },
    { value: "10", label: "10$", desc: "Patron" },
    { value: "50", label: "50$", desc: "Guardian" },
    { value: "Custom", label: "Custom", desc: "Your Choice" },
  ]

  const handleSelect = async (amount: string) => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    setSelectedAmount(amount)

    try {
      const result = await recordSupportIntent({
        amount,
        category: amount === "Custom" ? "One-time" : "Monthly",
      })

      if (result.success) {
        toast.success("Thank you for your support intent")
      }
    } catch (error) {
      toast.error("Failed to record intent")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl bg-black border border-zinc-800/50 p-5",
      className
    )}>
      {/* Violet accent glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl" />
      
      {/* Watermark */}
      <div className="absolute -bottom-2 -right-2 opacity-[0.03] pointer-events-none">
        <Crown className="h-16 w-16" />
      </div>

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-violet-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Support Mantoric
            </h3>
            <p className="text-[10px] text-zinc-500">
              Independent growth needs allies
            </p>
          </div>
        </div>

        {/* Question */}
        <p className="text-xs text-zinc-400 leading-relaxed">
          How much would you contribute to Mantoric&apos;s independent growth?
        </p>

        {/* Amount Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {amounts.map((amt) => (
            <button
              key={amt.value}
              onClick={() => handleSelect(amt.value)}
              disabled={isSubmitting}
              className={cn(
                "relative px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                "border hover:scale-[1.02] active:scale-[0.98]",
                selectedAmount === amt.value
                  ? "bg-violet-500/20 border-violet-500/50"
                  : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
              )}
            >
              <div className="flex items-center justify-between">
                <span className={cn(
                  "text-sm font-bold",
                  selectedAmount === amt.value ? "text-violet-300" : "text-white"
                )}>
                  {amt.label}
                </span>
              </div>
              <p className="text-[9px] text-zinc-500 mt-0.5">{amt.desc}</p>
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-[10px] text-zinc-600 text-center">
          Your intent helps us plan for the future
        </p>
      </div>
    </div>
  )
}
