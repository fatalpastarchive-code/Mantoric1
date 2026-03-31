"use client"

import { useState } from "react"
import { Sparkles, Heart } from "lucide-react"
import { cn } from "@/lib/utils"

interface RespectEmblemProps {
  count: number
  onClick?: () => void
  disabled?: boolean
  showTooltip?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "article" | "cultural" | "forum"
  isActive?: boolean
}

export function RespectEmblem({
  count,
  onClick,
  disabled = false,
  showTooltip = true,
  size = "md",
  variant = "article",
  isActive = false,
}: RespectEmblemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-[18px] w-[18px]",
    lg: "h-5 w-5",
  }

  const Icon = variant === "cultural" ? Heart : Sparkles

  return (
    <div className="relative inline-flex items-center">
      <button
        onClick={onClick}
        disabled={disabled}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "flex items-center gap-1.5 transition-all duration-300 rounded-full px-2 py-1",
          disabled 
            ? "cursor-default opacity-60" 
            : "cursor-pointer hover:bg-purple-500/10",
          isActive && "text-purple-400"
        )}
      >
        <Icon 
          className={cn(
            sizeClasses[size],
            "transition-all duration-300",
            isActive 
              ? "fill-purple-500 text-purple-500" 
              : "text-zinc-500 hover:text-purple-400",
            !disabled && "hover:scale-110"
          )} 
        />
        <span className={cn(
          "text-xs font-medium transition-colors",
          isActive ? "text-purple-400" : "text-zinc-500"
        )}>
          {count}
        </span>
      </button>

      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md text-[10px] text-zinc-300 whitespace-nowrap animate-in fade-in duration-200 z-50">
          {disabled ? "Open to Give Respect" : "Give Respect"}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-900 border-r border-b border-zinc-800 rotate-45" />
        </div>
      )}
    </div>
  )
}
