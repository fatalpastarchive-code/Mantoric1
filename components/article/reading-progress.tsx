"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ReadingProgressProps {
  className?: string
  color?: string
  height?: number
}

export function ReadingProgress({ 
  className, 
  color = "bg-gradient-to-r from-primary via-purple-500 to-emerald-500",
  height = 3
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const calculateProgress = useCallback(() => {
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight - windowHeight
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    
    if (documentHeight > 0) {
      const scrollPercent = (scrollTop / documentHeight) * 100
      setProgress(Math.min(100, Math.max(0, scrollPercent)))
      setIsVisible(scrollTop > 50)
    }
  }, [])

  useEffect(() => {
    // Initial calculation
    calculateProgress()

    // Add scroll listener with throttling for performance
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateProgress()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", calculateProgress, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", calculateProgress)
    }
  }, [calculateProgress])

  return (
    <div 
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0",
        className
      )}
      style={{ height }}
    >
      <div 
        className={cn("h-full transition-all duration-150 ease-out", color)}
        style={{ width: `${progress}%` }}
      />
      {/* Glow effect at the tip */}
      <div 
        className="absolute top-0 h-full w-4 bg-white/50 blur-sm transition-all duration-150 ease-out"
        style={{ left: `${progress}%`, transform: "translateX(-100%)" }}
      />
    </div>
  )
}

// Hook for reading completion tracking (for XP/quiz triggering)
export function useReadingProgress(threshold: number = 80) {
  const [progress, setProgress] = useState(0)
  const [hasReachedThreshold, setHasReachedThreshold] = useState(false)

  useEffect(() => {
    let ticking = false
    
    const calculateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight - windowHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      
      if (documentHeight > 0) {
        const scrollPercent = (scrollTop / documentHeight) * 100
        const newProgress = Math.min(100, Math.max(0, scrollPercent))
        setProgress(newProgress)
        
        if (newProgress >= threshold && !hasReachedThreshold) {
          setHasReachedThreshold(true)
        }
      }
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateProgress()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    calculateProgress() // Initial check

    return () => window.removeEventListener("scroll", handleScroll)
  }, [threshold, hasReachedThreshold])

  return { progress, hasReachedThreshold }
}
